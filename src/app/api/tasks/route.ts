import { NextRequest, NextResponse } from 'next/server'
import { getTenantDb } from '@/lib/db'
import { createTaskSchema } from '@/lib/validations'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canAccessCase, canWrite, denyUnless, enforceMutationBudget, caseLinkedAccessWhere } from '@/lib/auth/capabilities'
import { notifyUsers, recordWorkflowEvent } from '@/lib/workflow'
import { parsePagination, paginatedResponse } from '@/lib/http'

export async function GET(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const tdb = getTenantDb(auth)
  const { limit, cursor } = parsePagination(new URL(req.url))
  const [rows, total] = await Promise.all([
    tdb.task.findMany({
      where: { workspaceId: auth.workspaceId, deletedAt: null, ...caseLinkedAccessWhere(auth) },
      orderBy: { dueDate: 'asc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    tdb.task.count({ where: { workspaceId: auth.workspaceId, deletedAt: null, ...caseLinkedAccessWhere(auth) } }),
  ])
  return NextResponse.json(paginatedResponse(rows, limit, { total }))
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    const denied = denyUnless(auth, canWrite(auth))
    if (denied) return denied
    const budgeted = await enforceMutationBudget(auth)
    if (budgeted) return budgeted
    const tdb = getTenantDb(auth)

    const rawBody = await req.json()
    const parsed = createTaskSchema.parse(rawBody)
    if (parsed.caseId) {
      const legalCase = await tdb.legalCase.findFirst({ where: { id: parsed.caseId, workspaceId: auth.workspaceId, orgId: auth.orgId, deletedAt: null }, select: { id: true } })
      if (!legalCase || !(await canAccessCase(auth, legalCase.id))) return notFoundJson()
    }
    if (parsed.assignedToId) {
      // `disabledAt: null` filters out disabled users (correct field name on the schema)
      const assignee = await tdb.user.findFirst({ where: { id: parsed.assignedToId, workspaceId: auth.workspaceId, orgId: auth.orgId, disabledAt: null }, select: { id: true } })
      if (!assignee) return notFoundJson()
    }
    const task = await tdb.task.create({ data: { ...parsed, workspaceId: auth.workspaceId } })
    await recordWorkflowEvent({ workspaceId: auth.workspaceId, caseId: task.caseId, taskId: task.id, actorId: auth.userId, action: 'task_create', toState: task.status })
    // Use parsed.assignedToId — the Prisma create return type omits relation fields
    if (parsed.assignedToId && parsed.assignedToId !== auth.userId) {
      await notifyUsers(auth.workspaceId, [parsed.assignedToId], {
        type: 'assignment',
        actorId: auth.userId,
        title: 'مهمة جديدة',
        message: task.title,
        link: '/lawyer/tasks',
        entityType: 'Task',
        entityId: task.id,
      })
    }
    return NextResponse.json(task)
  } catch (err: unknown) {
    const e = err as { name?: string; errors?: unknown; message?: string }
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: e.errors }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message || 'Failed to create task' }, { status: 500 })
  }
}
