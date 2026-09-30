import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!['admin', 'workspace_owner', 'lawyer'].includes(auth.role)) return forbiddenJson()
  const { id } = await params
  const access = await db.portalAccess.findFirst({ where: { id, workspaceId: auth.workspaceId }, select: { id: true } })
  if (!access) return notFoundJson()
  await db.$transaction(async (tx) => {
    await tx.portalAccess.update({ where: { id }, data: { revokedAt: new Date() } })
    await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'portal.link.revoke', entityType: 'PortalAccess', entityId: id } })
  })
  return NextResponse.json({ ok: true })
}
