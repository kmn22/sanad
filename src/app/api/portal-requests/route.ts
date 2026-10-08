import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canWrite, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'
import { notifyUsers, recordWorkflowEvent } from '@/lib/workflow'

const PRIORITIES = new Set(['low', 'normal', 'high', 'urgent'])

export async function GET(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const mine = req.nextUrl.searchParams.get('mine') === '1'
  const requests = await db.portalRequest.findMany({
    where: { workspaceId: auth.workspaceId, ...(mine ? { assignedToId: auth.userId } : {}) },
    orderBy: [{ dueDate: 'asc' }, { updatedAt: 'desc' }],
    take: 100,
    include: {
      client: { select: { id: true, name: true } },
      case: { select: { id: true, title: true, stage: true } },
      assignedTo: { select: { id: true, name: true, role: true } },
      files: { select: { id: true, originalName: true, sizeBytes: true, createdAt: true } },
    },
  })
  return NextResponse.json(requests)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const denied = denyUnless(auth, canWrite(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  const body = await req.json().catch(() => null)
  const clientId = typeof body?.clientId === 'string' ? body.clientId : ''
  const caseId = typeof body?.caseId === 'string' && body.caseId ? body.caseId : null
  const assignedToId = typeof body?.assignedToId === 'string' && body.assignedToId ? body.assignedToId : null
  const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 160) : ''
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 4000) : ''
  const priority = PRIORITIES.has(body?.priority) ? body.priority : 'normal'
  const dueDate = typeof body?.dueDate === 'string' && body.dueDate ? new Date(body.dueDate) : null
  if (!clientId || !title || !message || (dueDate && Number.isNaN(dueDate.getTime()))) {
    return NextResponse.json({ error: 'Invalid request details' }, { status: 400 })
  }

  const client = await db.client.findFirst({ where: { id: clientId, workspaceId: auth.workspaceId }, select: { id: true, name: true } })
  if (!client) return notFoundJson()
  if (caseId) {
    const legalCase = await db.legalCase.findFirst({ where: { id: caseId, clientId, workspaceId: auth.workspaceId }, select: { id: true } })
    if (!legalCase) return notFoundJson()
  }
  if (assignedToId) {
    const member = await db.user.findFirst({ where: { id: assignedToId, workspaceId: auth.workspaceId, disabledAt: null, role: { not: 'client' } }, select: { id: true } })
    if (!member) return notFoundJson()
  }

  const portalAccess = await db.portalAccess.findFirst({
    where: { workspaceId: auth.workspaceId, clientId, revokedAt: null, expiresAt: { gt: new Date() }, ...(caseId ? { OR: [{ caseId }, { caseId: null }] } : {}) },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
  if (!portalAccess) {
    return NextResponse.json({ error: 'Create an active client portal link before sending a request' }, { status: 409 })
  }

  const created = await db.$transaction(async (tx) => {
    const request = await tx.portalRequest.create({
      data: { workspaceId: auth.workspaceId, portalAccessId: portalAccess.id, clientId, caseId, assignedToId, createdBy: 'user', title, message, priority, dueDate },
    })
    await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'portal.request.create.internal', entityType: 'PortalRequest', entityId: request.id } })
    return request
  })
  await recordWorkflowEvent({ workspaceId: auth.workspaceId, caseId, actorId: auth.userId, action: 'client_request_create', toState: 'open', metadata: { requestId: created.id, clientId, assignedToId } })

  const clientUsers = await db.user.findMany({ where: { workspaceId: auth.workspaceId, clientId, role: 'client', disabledAt: null }, select: { id: true } })
  await notifyUsers(auth.workspaceId, clientUsers.map((user) => user.id), {
    type: 'portal',
    actorId: auth.userId,
    title: 'طلب جديد من المكتب',
    message: title,
    link: '/client',
    entityType: 'PortalRequest',
    entityId: created.id,
  })
  if (assignedToId) {
    await notifyUsers(auth.workspaceId, [assignedToId], {
      type: 'assignment',
      actorId: auth.userId,
      title: 'تم تعيين طلب عميل لك',
      message: `${client.name}: ${title}`,
      link: '/lawyer/workflow',
      entityType: 'PortalRequest',
      entityId: created.id,
    })
  }
  return NextResponse.json(created, { status: 201 })
}
