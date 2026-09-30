import { db } from '@/lib/db'
import type { AuthContext } from '@/lib/auth/workspace'

export const CASE_STAGES = new Set(['drafting', 'client_review', 'filed', 'closed'])
export const CASE_ASSIGNMENT_ROLES = new Set(['lead', 'assignee', 'reviewer', 'observer'])
export const TASK_STATUSES = new Set(['todo', 'in_progress', 'done'])

export function canManageWorkflow(auth: AuthContext) {
  return ['admin', 'workspace_owner', 'lawyer'].includes(auth.role)
}

export async function recordWorkflowEvent(data: {
  workspaceId: string
  caseId?: string | null
  taskId?: string | null
  actorId?: string | null
  action: string
  fromState?: string | null
  toState?: string | null
  note?: string | null
  metadata?: Record<string, unknown>
}) {
  return db.workflowEvent.create({
    data: {
      workspaceId: data.workspaceId,
      caseId: data.caseId || null,
      taskId: data.taskId || null,
      actorId: data.actorId || null,
      action: data.action,
      fromState: data.fromState || null,
      toState: data.toState || null,
      note: data.note || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
  })
}

export async function notifyUsers(
  workspaceId: string,
  userIds: string[],
  notification: { title: string; message: string; link?: string; type?: string; actorId?: string; entityType?: string; entityId?: string },
) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))]
  if (!uniqueIds.length) return
  await db.notification.createMany({
    data: uniqueIds.map((userId) => ({
      workspaceId,
      userId,
      actorId: notification.actorId || null,
      type: notification.type || 'workflow',
      title: notification.title,
      message: notification.message,
      link: notification.link || null,
      entityType: notification.entityType || null,
      entityId: notification.entityId || null,
    })),
  })
}

export async function activeCaseUserIds(workspaceId: string, caseId: string) {
  const assignments = await db.caseAssignment.findMany({
    where: { workspaceId, caseId, active: true },
    select: { userId: true },
  })
  return assignments.map((item) => item.userId)
}
