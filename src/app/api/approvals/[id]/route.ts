import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canAccessCase } from '@/lib/auth/capabilities'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { notifyUsers, recordWorkflowEvent } from '@/lib/workflow'

const DECISIONS = new Set(['approved', 'rejected'])

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!(await isFeatureEnabled(auth.workspaceId, 'workflow_approvals'))) return forbiddenJson()
  const { id } = await params
  const approval = await db.approval.findFirst({ where: { id, workspaceId: auth.workspaceId } })
  if (!approval) return notFoundJson()
  const linkedCaseId = approval.caseId
    ?? (approval.documentId ? (await db.legalDocument.findUnique({ where: { id: approval.documentId }, select: { caseId: true } }))?.caseId : null)
    ?? (approval.taskId ? (await db.task.findUnique({ where: { id: approval.taskId }, select: { caseId: true } }))?.caseId : null)
  if (linkedCaseId && !(await canAccessCase(auth, linkedCaseId))) return notFoundJson()
  if (approval.status !== 'pending') return NextResponse.json({ error: 'This approval has already been decided' }, { status: 409 })

  const body = await req.json().catch(() => null)
  const decisionNote = typeof body?.decisionNote === 'string' ? body.decisionNote.trim().slice(0, 1000) : null

  if (body?.action === 'cancel') {
    if (approval.requestedById !== auth.userId && !['admin', 'workspace_owner'].includes(auth.role)) return forbiddenJson()
    const updated = await db.$transaction(async (tx) => {
      const row = await tx.approval.update({ where: { id }, data: { status: 'cancelled', decidedAt: new Date() } })
      await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'approval.cancel', entityType: 'Approval', entityId: id } })
      return row
    })
    return NextResponse.json(updated)
  }

  const decision = typeof body?.decision === 'string' ? body.decision : ''
  if (!DECISIONS.has(decision)) return NextResponse.json({ error: 'decision must be approved or rejected' }, { status: 400 })
  if (approval.approverId !== auth.userId) return forbiddenJson()

  const updated = await db.$transaction(async (tx) => {
    const row = await tx.approval.update({ where: { id }, data: { status: decision, decisionNote, decidedAt: new Date() } })
    await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: `approval.${decision}`, entityType: 'Approval', entityId: id } })
    return row
  })
  if (approval.caseId) {
    await recordWorkflowEvent({ workspaceId: auth.workspaceId, caseId: approval.caseId, actorId: auth.userId, action: `approval_${decision}`, toState: decision, note: decisionNote, metadata: { approvalId: id } })
  }
  await notifyUsers(auth.workspaceId, [approval.requestedById], {
    type: 'approval',
    actorId: auth.userId,
    title: decision === 'approved' ? 'تم اعتماد طلبك' : 'تم رفض طلب الاعتماد',
    message: `${approval.title}${decisionNote ? ` — ${decisionNote}` : ''}`,
    link: '/firm/workflow',
    entityType: 'Approval',
    entityId: id,
  })
  return NextResponse.json(updated)
}
