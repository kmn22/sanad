import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canWriteAcademic, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'
import { requireEducation } from '@/lib/saas/entitlements'

export async function GET() {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const eduGate = await requireEducation(workspaceId)
  if (eduGate) return eduGate
  const deadlines = await db.academicDeadline.findMany({
    where: { workspaceId },
    orderBy: { dueDate: 'asc' },
    include: { course: true },
  })
  return NextResponse.json(deadlines)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const eduGate = await requireEducation(auth.workspaceId)
  if (eduGate) return eduGate
  const denied = denyUnless(auth, canWriteAcademic(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  const workspaceId = auth.workspaceId
  const body = await req.json()
  if (body.courseId) {
    const course = await db.course.findFirst({ where: { id: body.courseId, workspaceId }, select: { id: true } })
    if (!course) return notFoundJson()
  }
  const deadline = await db.academicDeadline.create({ data: { ...body, id: undefined, workspaceId } })
  return NextResponse.json(deadline, { status: 201 })
}
