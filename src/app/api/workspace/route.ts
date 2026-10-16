import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import { verifyPassword } from '@/lib/auth/password'
import { logError, logEvent } from '@/lib/observability'
import { deleteEncryptedFile } from '@/lib/file-storage'

export async function PATCH(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!['admin', 'workspace_owner'].includes(auth.role) && !auth.isOwner) return forbiddenJson()
  const body = await req.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : ''
  const domain = typeof body?.domain === 'string' ? body.domain.trim().toLowerCase().slice(0, 253) : ''
  if (name.length < 2 || (domain && !/^(?!-)(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(domain))) {
    return NextResponse.json({ error: 'Invalid workspace name or domain' }, { status: 400 })
  }
  try {
    const workspace = await db.$transaction(async (tx) => {
      const updated = await tx.workspace.update({ where: { id: auth.workspaceId }, data: { name, domain: domain || null }, select: { id: true, name: true, domain: true, type: true } })
      await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'workspace.update', entityType: 'Workspace', entityId: auth.workspaceId } })
      return updated
    })
    return NextResponse.json(workspace)
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ error: 'Domain is already assigned to another workspace' }, { status: 409 })
    return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 })
  }
}

// DELETE /api/workspace — PDPL self-service workspace erasure.
// Owner-only, MFA-gated, requires typing the workspace name and the account
// password. Deletes every workspace-scoped row (children before parents so
// RESTRICT constraints never fire), deletes or re-homes member users, purges
// their pending tokens, and best-effort removes orphaned uploaded files.
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    if (auth.role !== 'workspace_owner' && !auth.isOwner) return forbiddenJson()
    if (!auth.mfaEnabled) {
      return NextResponse.json(
        { error: 'Multi-factor authentication must be enabled before the workspace can be deleted', code: 'MFA_REQUIRED' },
        { status: 403 },
      )
    }

    const body = await req.json().catch(() => null)
    const confirmName = typeof body?.confirmName === 'string' ? body.confirmName.trim() : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    if (!confirmName || !password) {
      return NextResponse.json({ error: 'Workspace name confirmation and password are required' }, { status: 400 })
    }

    const workspace = await db.workspace.findUnique({
      where: { id: auth.workspaceId },
      select: { id: true, name: true },
    })
    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    if (confirmName !== workspace.name) {
      return NextResponse.json({ error: 'Workspace name does not match' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: auth.userId }, select: { id: true, password: true } })
    if (!user?.password || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const activeHold = await db.legalHold.findFirst({
      where: { workspaceId: workspace.id, releasedAt: null },
      select: { id: true },
    })
    if (activeHold) {
      return NextResponse.json(
        { error: 'This workspace has an active legal hold and cannot be deleted', code: 'LEGAL_HOLD' },
        { status: 409 },
      )
    }

    logEvent('warn', 'privacy.workspace.delete_requested', { req, userId: auth.userId, workspaceId: workspace.id })

    let removedFileKeys: string[] = []
    let removedUserEmails: string[] = []
    await db.$transaction(
      async (tx) => {
        // Enumerate every workspace-scoped table and the FK edges between them,
        // then delete children first so RESTRICT constraints never trigger.
        const scoped = await tx.$queryRaw<Array<{ table_name: string }>>`
          SELECT table_name FROM information_schema.columns
          WHERE column_name = 'workspaceId' AND table_schema = 'public'`
        const pending = new Set(scoped.map((row) => row.table_name))
        pending.delete('User')
        pending.delete('WorkspaceMembership')
        const edges = await tx.$queryRaw<Array<{ child: string; parent: string }>>`
          SELECT cls.relname AS child, prnt.relname AS parent
          FROM pg_constraint c
          JOIN pg_class cls ON cls.oid = c.conrelid
          JOIN pg_class prnt ON prnt.oid = c.confrelid
          JOIN pg_namespace n ON n.oid = cls.relnamespace
          WHERE c.contype = 'f' AND n.nspname = 'public'`
        const order: string[] = []
        while (pending.size) {
          const deletable = [...pending].filter(
            (t) => !edges.some((e) => e.parent === t && pending.has(e.child) && e.child !== t),
          )
          if (!deletable.length) throw new Error('Circular FK dependency among workspace tables')
          for (const t of deletable) {
            pending.delete(t)
            order.push(t)
          }
        }

        // File keys needed for post-commit storage cleanup.
        const docs = await tx.legalDocument.findMany({
          where: { workspaceId: workspace.id, fileKey: { not: null } },
          select: { fileKey: true },
        })
        const portalFiles = await tx.portalFile.findMany({
          where: { workspaceId: workspace.id },
          select: { fileKey: true },
        })
        removedFileKeys = [...docs.map((row) => row.fileKey), ...portalFiles.map((row) => row.fileKey)].filter((key): key is string => Boolean(key))

        for (const table of order) {
          await tx.$executeRawUnsafe(
            `DELETE FROM "${table.replace(/"/g, '""')}" WHERE "workspaceId" = $1`,
            workspace.id,
          )
        }

        // Users whose home workspace is this one: re-home them to NULL when
        // they still belong to other workspaces; otherwise delete the account.
        await tx.$executeRaw`
          UPDATE "User" u SET "workspaceId" = NULL
          WHERE u."workspaceId" = ${workspace.id}
            AND EXISTS (
              SELECT 1 FROM "WorkspaceMembership" m
              WHERE m."userId" = u.id AND m."workspaceId" <> ${workspace.id}
            )`
        const deletedUsers = await tx.$queryRaw<Array<{ email: string }>>`
          DELETE FROM "User" WHERE "workspaceId" = ${workspace.id} RETURNING email`
        removedUserEmails = deletedUsers.map((row) => row.email)

        await tx.workspaceMembership.deleteMany({ where: { workspaceId: workspace.id } })
        await tx.workspace.delete({ where: { id: workspace.id } })
      },
      { timeout: 60000 },
    )

    // Best-effort cleanup outside the transaction: pending auth tokens for the
    // removed accounts and orphaned encrypted uploads on disk.
    if (removedUserEmails.length) {
      await db.verificationToken.deleteMany({ where: { email: { in: removedUserEmails } } })
      await db.passwordResetToken.deleteMany({ where: { email: { in: removedUserEmails } } })
    }
    for (const key of removedFileKeys) {
      try {
        await deleteEncryptedFile(key)
      } catch {
        logEvent('warn', 'privacy.workspace.file_cleanup_failed', { req, workspaceId: workspace.id, fileKey: key })
      }
    }

    logEvent('info', 'privacy.workspace.deleted', {
      req,
      userId: auth.userId,
      workspaceId: workspace.id,
      removedUsers: removedUserEmails.length,
      removedFiles: removedFileKeys.length,
    })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    logError(error, { req, msg: 'Workspace deletion failed', route: 'DELETE /api/workspace' })
    return NextResponse.json({ error: 'Failed to delete workspace' }, { status: 500 })
  }
}
