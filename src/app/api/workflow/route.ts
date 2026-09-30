import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { CASE_ASSIGNMENT_ROLES, CASE_STAGES, activeCaseUserIds, canManageWorkflow, notifyUsers, recordWorkflowEvent } from '@/lib/workflow'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const [cases, events, requests, tasks] = await Promise.all([
    db.legalCase.findMany({
      where: { workspaceId: auth.workspaceId },
      orderBy: { updatedAt: 'desc' },
      take: 100,
      include: {
        client: { select: { id: true, name: true } },
        assignments: { where: { active: true }, include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      },
    }),
    db.workflowEvent.findMany({ where: { workspaceId: auth.workspaceId }, orderBy: { createdAt: 'desc' }, take: 100, include: { actor: { select: { id: true, name: true } } } }),
    db.portalRequest.findMany({ where: { workspaceId: auth.workspaceId }, orderBy: { updatedAt: 'desc' }, take: 100, include: { client: { select: { id: true, name: true } }, case: { select: { id: true, title: true } }, assignedTo: { select: { id: true, name: true } } } }),
    db.task.findMany({ where: { workspaceId: auth.workspaceId, status: { not: 'done' } }, orderBy: { dueDate: 'asc' }, take: 100, include: { assignedTo: { select: { id: true, name: true, role: true } } } }),
  ])
  return NextResponse.json({ cases, events, requests, tasks })
}

async function canActOnCase(auth: NonNullable<Awaited<ReturnType<typeof getAuthContext>>>, caseId: string) {
  if (canManageWorkflow(auth)) return true
  const assigned = await db.caseAssignment.findFirst({ where: { workspaceId: auth.workspaceId, caseId, userId: auth.userId, active: true }, select: { id: true } })
  return Boolean(assigned)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const body = await req.json().catch(() => null)
  const action = typeof body?.action === 'string' ? body.action : ''
  const caseId = typeof body?.caseId === 'string' ? body.caseId : ''
  const note = typeof body?.note === 'string' ? body.note.trim().slice(0, 1000) : null
  const legalCase = await db.legalCase.findFirst({ where: { id: caseId, workspaceId: auth.workspaceId }, select: { id: true, title: true, stage: true, clientId: true } })
  if (!legalCase) return notFoundJson()
  if (!(await canActOnCase(auth, legalCase.id))) return forbiddenJson()

  if (action === 'assign' || action === 'unassign') {
    if (!canManageWorkflow(auth)) return forbiddenJson()
    const userId = typeof body?.userId === 'string' ? body.userId : ''
    const role = CASE_ASSIGNMENT_ROLES.has(body?.role) ? body.role : 'assignee'
    const member = await db.user.findFirst({ where: { id: userId, workspaceId: auth.workspaceId, disabledAt: null }, select: { id: true, name: true } })
    if (!member) return notFoundJson()
    await db.$transaction(async (tx) => {
      await tx.caseAssignment.upsert({
        where: { caseId_userId: { caseId: legalCase.id, userId: member.id } },
        create: { workspaceId: auth.workspaceId, caseId: legalCase.id, userId: member.id, assignedById: auth.userId, role, active: action === 'assign' },
        update: { role, active: action === 'assign', assignedById: auth.userId },
      })
      await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: `workflow.${action}`, entityType: 'LegalCase', entityId: legalCase.id } })
    })
    await recordWorkflowEvent({ workspaceId: auth.workspaceId, caseId: legalCase.id, actorId: auth.userId, action, toState: role, note, metadata: { userId: member.id } })
    await notifyUsers(auth.workspaceId, [member.id], {
      type: 'assignment',
      actorId: auth.userId,
      title: action === 'assign' ? 'تم تعيينك على قضية' : 'تم إلغاء تعيينك من قضية',
      message: legalCase.title,
      link: `/cases/${legalCase.id}`,
      entityType: 'LegalCase',
      entityId: legalCase.id,
    })
    return NextResponse.json({ ok: true })
  }

  if (action === 'stage') {
    const stage = typeof body?.stage === 'string' ? body.stage : ''
    if (!CASE_STAGES.has(stage)) return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
    const previous = legalCase.stage
    if (previous === stage) return NextResponse.json({ ok: true })
    await db.$transaction(async (tx) => {
      await tx.legalCase.update({ where: { id: legalCase.id }, data: { stage } })
      await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'workflow.stage', entityType: 'LegalCase', entityId: legalCase.id } })
    })
    await recordWorkflowEvent({ workspaceId: auth.workspaceId, caseId: legalCase.id, actorId: auth.userId, action: 'stage_change', fromState: previous, toState: stage, note })
    await notifyUsers(auth.workspaceId, (await activeCaseUserIds(auth.workspaceId, legalCase.id)).filter((id) => id !== auth.userId), {
      type: 'workflow',
      actorId: auth.userId,
      title: 'تحديث مرحلة القضية',
      message: `${legalCase.title}: ${previous} → ${stage}`,
      link: `/cases/${legalCase.id}`,
      entityType: 'LegalCase',
      entityId: legalCase.id,
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
