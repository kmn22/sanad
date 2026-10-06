import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const body = await req.json().catch(() => null)
  const workspaceId = typeof body?.workspaceId === 'string' ? body.workspaceId : ''
  const membership = await db.workspaceMembership.findFirst({
    where: { workspaceId, userId: auth.userId, status: 'active', workspace: { status: 'active' } },
    select: { workspaceId: true, role: true },
  })
  if (!membership) return notFoundJson()
  if (membership.workspaceId === auth.workspaceId) return NextResponse.json({ ok: true, requiresSignIn: false })
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: auth.userId }, data: { workspaceId: membership.workspaceId, role: membership.role, sessionVersion: { increment: 1 } } })
    await tx.auditLog.create({ data: { workspaceId: membership.workspaceId, userId: auth.userId, action: 'workspace.switch', entityType: 'Workspace', entityId: membership.workspaceId } })
  })
  return NextResponse.json({ ok: true, requiresSignIn: true })
}
