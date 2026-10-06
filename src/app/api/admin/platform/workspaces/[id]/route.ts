import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { canManageUsers, forbiddenJson, getAuthContext, hasRole, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

const ACTIONS = new Set(['suspend', 'reactivate', 'archive'])

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!hasRole(auth, ['admin']) || !canManageUsers(auth)) return forbiddenJson()

  const { id } = await params
  const workspace = await db.workspace.findUnique({ where: { id }, select: { id: true, status: true, name: true } })
  if (!workspace) return notFoundJson()

  const body = await req.json().catch(() => null)
  const action = typeof body?.action === 'string' ? body.action : ''
  const reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, 500) : ''
  if (!ACTIONS.has(action)) return NextResponse.json({ error: 'action must be suspend | reactivate | archive' }, { status: 400 })
  if ((action === 'suspend' || action === 'archive') && reason.length < 3) {
    return NextResponse.json({ error: 'A reason is required' }, { status: 400 })
  }
  if (action === 'reactivate' && workspace.status === 'active') {
    return NextResponse.json({ error: 'Workspace is already active' }, { status: 409 })
  }
  if (action !== 'reactivate' && workspace.status !== 'active') {
    return NextResponse.json({ error: `Workspace is already ${workspace.status}` }, { status: 409 })
  }

  const next = action === 'reactivate' ? 'active' : action === 'suspend' ? 'suspended' : 'archived'
  await db.$transaction(async (tx) => {
    await tx.workspace.update({
      where: { id },
      data: {
        status: next,
        suspendedAt: action === 'suspend' ? new Date() : null,
        suspensionReason: action === 'suspend' ? reason : action === 'archive' ? reason : null,
      },
    })
    if (next !== 'active') {
      // End every member session — a suspended workspace must stop working immediately.
      await tx.user.updateMany({ where: { memberships: { some: { workspaceId: id, status: 'active' } } }, data: { sessionVersion: { increment: 1 } } })
    }
    await tx.auditLog.create({
      data: {
        workspaceId: id,
        userId: auth.userId,
        action: `platform.workspace.${action}`,
        entityType: 'Workspace',
        entityId: id,
        metadata: JSON.stringify({ reason: reason || null, previousStatus: workspace.status }),
      },
    })
  })
  return NextResponse.json({ ok: true, status: next })
}
