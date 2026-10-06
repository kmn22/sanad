import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { notifyUsers, recordWorkflowEvent } from '@/lib/workflow'
import { hasEntitlement } from '@/lib/saas/entitlements'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!(await hasEntitlement(auth.workspaceId, 'workflow'))) return forbiddenJson()
  const scope = new URL(req.url).searchParams.get('scope')
  const where = {
    workspaceId: auth.workspaceId,
    ...(scope === 'approver' ? { approverId: auth.userId, status: 'pending' } : {}),
    ...(scope === 'requester' ? { requestedById: auth.userId } : {}),
  }
  const approvals = await db.approval.findMany({
    where,
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 100,
    include: {
      case: { select: { id: true, title: true, stage: true } },
      document: { select: { id: true, title: true, docType: true } },
      requestedBy: { select: { id: true, name: true, email: true } },
      approver: { select: { id: true, name: true, email: true } },
    },
  })
  return NextResponse.json(approvals)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!(await hasEntitlement(auth.workspaceId, 'workflow'))) return forbiddenJson()
  const limited = await rateLimit(`approval:create:${auth.userId}`, 30, 60 * 60 * 1000)
  if (!limited.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const body = await req.json().catch(() => null)
  const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 200) : ''
  const details = typeof body?.details === 'string' ? body.details.trim().slice(0, 4000) : null
  const caseId = typeof body?.caseId === 'string' && body.caseId ? body.caseId : null
  const documentId = typeof body?.documentId === 'string' && body.documentId ? body.documentId : null
  const taskId = typeof body?.taskId === 'string' && body.taskId ? body.taskId : null
  const approverId = typeof body?.approverId === 'string' ? body.approverId : ''
  if (!title || !approverId) return NextResponse.json({ error: 'Title and approver are required' }, { status: 400 })
  if (!caseId && !documentId && !taskId) return NextResponse.json({ error: 'An approval must reference a case, document, or task' }, { status: 400 })
  if (approverId === auth.userId) return NextResponse.json({ error: 'You cannot approve your own request' }, { status: 400 })

  const approver = await db.user.findFirst({
    where: { id: approverId, workspaceId: auth.workspaceId, disabledAt: null, role: { not: 'client' } },
    select: { id: true, name: true, role: true },
  })
  if (!approver) return notFoundJson()

  if (caseId) {
    const legalCase = await db.legalCase.findFirst({ where: { id: caseId, workspaceId: auth.workspaceId }, select: { id: true } })
    if (!legalCase) return notFoundJson()
  }
  if (documentId) {
    const document = await db.legalDocument.findFirst({ where: { id: documentId, workspaceId: auth.workspaceId }, select: { id: true } })
    if (!document) return notFoundJson()
  }
  if (taskId) {
    const task = await db.task.findFirst({ where: { id: taskId, workspaceId: auth.workspaceId }, select: { id: true } })
    if (!task) return notFoundJson()
  }

  const approval = await db.$transaction(async (tx) => {
    const created = await tx.approval.create({
      data: { workspaceId: auth.workspaceId, caseId, documentId, taskId, title, details, requestedById: auth.userId, approverId },
    })
    await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'approval.request', entityType: 'Approval', entityId: created.id } })
    return created
  })
  if (caseId) {
    await recordWorkflowEvent({ workspaceId: auth.workspaceId, caseId, actorId: auth.userId, action: 'approval_request', toState: 'pending', metadata: { approvalId: approval.id, approverId } })
  }
  await notifyUsers(auth.workspaceId, [approverId], {
    type: 'approval',
    actorId: auth.userId,
    title: 'طلب اعتماد جديد',
    message: title,
    link: '/firm/workflow',
    entityType: 'Approval',
    entityId: approval.id,
  })
  return NextResponse.json(approval, { status: 201 })
}
