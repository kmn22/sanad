import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canWriteAcademic, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'
import { requireEducation } from '@/lib/saas/entitlements'
import { createLectureSchema } from '@/lib/validations'

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
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const parsed = createLectureSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
  }
  const course = await db.course.findFirst({ where: { id: parsed.data.courseId, workspaceId }, select: { id: true } })
  if (!course) return notFoundJson()
  const lecture = await db.lecture.create({ data: { ...parsed.data, workspaceId } })
  return NextResponse.json(lecture, { status: 201 })
}
