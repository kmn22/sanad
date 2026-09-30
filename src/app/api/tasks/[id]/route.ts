import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateTaskSchema } from '@/lib/validations'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { notifyUsers, recordWorkflowEvent } from '@/lib/workflow'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    const { id } = await params
    const parsed = updateTaskSchema.parse(await req.json())
    const existing = await db.task.findFirst({ where: { id, workspaceId: auth.workspaceId } })
    if (!existing) return notFoundJson()
    if (parsed.caseId) {
      const legalCase = await db.legalCase.findFirst({ where: { id: parsed.caseId, workspaceId: auth.workspaceId }, select: { id: true } })
      if (!legalCase) return notFoundJson()
    }
    if (parsed.assignedToId) {
      const assignee = await db.user.findFirst({ where: { id: parsed.assignedToId, workspaceId: auth.workspaceId, disabledAt: null }, select: { id: true } })
      if (!assignee) return notFoundJson()
    }
    const updated = await db.task.update({ where: { id }, data: parsed })
    await recordWorkflowEvent({
      workspaceId: auth.workspaceId,
      caseId: updated.caseId,
      taskId: updated.id,
      actorId: auth.userId,
      action: 'task_update',
      fromState: existing.status,
      toState: updated.status,
      metadata: { assignedToId: updated.assignedToId },
    })
    if (updated.assignedToId && updated.assignedToId !== existing.assignedToId && updated.assignedToId !== auth.userId) {
      await notifyUsers(auth.workspaceId, [updated.assignedToId], {
        type: 'assignment',
        actorId: auth.userId,
        title: 'تم تعيين مهمة لك',
        message: updated.title,
        link: '/tasks',
        entityType: 'Task',
        entityId: updated.id,
      })
    }
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const { id } = await params
  const result = await db.task.deleteMany({ where: { id, workspaceId: auth.workspaceId } })
  if (!result.count) return notFoundJson()
  return NextResponse.json({ ok: true })
}
