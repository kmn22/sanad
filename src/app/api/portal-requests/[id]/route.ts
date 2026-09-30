import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { notifyUsers, recordWorkflowEvent } from '@/lib/workflow'

const STATUSES = new Set(['open', 'answered', 'closed'])

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const { id } = await params
  const body = await req.json().catch(() => null)
  const existing = await db.portalRequest.findFirst({ where: { id, workspaceId: auth.workspaceId } })
  if (!existing) return notFoundJson()

  const data: { status?: string; assignedToId?: string | null } = {}
  if (body?.status !== undefined) {
    if (!STATUSES.has(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    data.status = body.status
  }
  if (body?.assignedToId !== undefined) {
    if (body.assignedToId === null) data.assignedToId = null
    else {
      const member = await db.user.findFirst({ where: { id: body.assignedToId, workspaceId: auth.workspaceId, disabledAt: null }, select: { id: true } })
      if (!member) return notFoundJson()
      data.assignedToId = member.id
    }
  }
  const updated = await db.$transaction(async (tx) => {
    const request = await tx.portalRequest.update({ where: { id }, data })
    await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'portal.request.update', entityType: 'PortalRequest', entityId: id } })
    return request
  })
  await recordWorkflowEvent({
    workspaceId: auth.workspaceId,
    caseId: updated.caseId,
    actorId: auth.userId,
    action: 'portal_request_update',
    fromState: existing.status,
    toState: updated.status,
    metadata: { requestId: id, assignedToId: updated.assignedToId },
  })
  if (updated.assignedToId && updated.assignedToId !== auth.userId) {
    await notifyUsers(auth.workspaceId, [updated.assignedToId], {
      type: 'portal',
      actorId: auth.userId,
      title: 'تم تعيين طلب عميل لك',
      message: updated.title,
      link: '/workflow',
      entityType: 'PortalRequest',
      entityId: updated.id,
    })
  }
  return NextResponse.json(updated)
}
