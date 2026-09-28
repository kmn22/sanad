import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const courseId = req.nextUrl.searchParams.get('courseId')
  const lectures = await db.lecture.findMany({
    where: { workspaceId, ...(courseId ? { courseId } : {}) },
    orderBy: { lectureDate: 'desc' },
    include: { course: true },
  })
  return NextResponse.json(lectures)
}

export async function POST(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const body = await req.json()
  const course = await db.course.findFirst({ where: { id: body.courseId, workspaceId }, select: { id: true } })
  if (!course) return notFoundJson()
  const lecture = await db.lecture.create({ data: { ...body, id: undefined, workspaceId } })
  return NextResponse.json(lecture, { status: 201 })
}
