import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canWriteAcademic, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'
import { requireEducation } from '@/lib/saas/entitlements'

export async function GET(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const eduGate = await requireEducation(workspaceId)
  if (eduGate) return eduGate
  const courseId = req.nextUrl.searchParams.get('courseId')
  const lectures = await db.lecture.findMany({
    where: { workspaceId, ...(courseId ? { courseId } : {}) },
    orderBy: { lectureDate: 'desc' },
    include: { course: true },
  })
  return NextResponse.json(lectures)
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
  const course = await db.course.findFirst({ where: { id: body.courseId, workspaceId }, select: { id: true } })
  if (!course) return notFoundJson()
  const lecture = await db.lecture.create({ data: { ...body, id: undefined, workspaceId } })
  return NextResponse.json(lecture, { status: 201 })
}
