import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (auth.role !== 'workspace_owner' || !auth.mfaEnabled) return forbiddenJson()
  const body = await req.json().catch(() => null)
  const targetUserId = typeof body?.targetUserId === 'string' ? body.targetUserId : ''
  const confirmation = typeof body?.confirmation === 'string' ? body.confirmation.trim() : ''
  if (!targetUserId || confirmation !== 'TRANSFER') return NextResponse.json({ error: 'Explicit confirmation is required' }, { status: 400 })
  if (targetUserId === auth.userId) return NextResponse.json({ error: 'You already own this workspace' }, { status: 400 })

  const target = await db.workspaceMembership.findFirst({
    where: { workspaceId: auth.workspaceId, userId: targetUserId, status: 'active', user: { disabledAt: null, role: { in: ['lawyer', 'staff'] } } },
    include: { user: { select: { id: true, email: true } } },
  })
  if (!target) return notFoundJson()

  await db.$transaction(async (tx) => {
    await tx.workspace.update({ where: { id: auth.workspaceId }, data: { ownerId: targetUserId } })
    await tx.workspaceMembership.updateMany({ where: { workspaceId: auth.workspaceId, isOwner: true }, data: { isOwner: false, role: 'lawyer' } })
    await tx.workspaceMembership.update({ where: { id: target.id }, data: { isOwner: true, role: 'workspace_owner' } })
    await tx.user.update({ where: { id: auth.userId }, data: { role: 'lawyer', sessionVersion: { increment: 1 } } })
    await tx.user.update({ where: { id: targetUserId }, data: { role: 'workspace_owner', sessionVersion: { increment: 1 } } })
    await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'workspace.ownership.transfer', entityType: 'Workspace', entityId: auth.workspaceId, metadata: JSON.stringify({ fromUserId: auth.userId, toUserId: targetUserId, targetEmail: target.user.email }) } })
  })
  return NextResponse.json({ ok: true, requiresSignIn: true })
}
