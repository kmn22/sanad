import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const deadlines = await db.academicDeadline.findMany({
    where: { workspaceId },
    orderBy: { dueDate: 'asc' },
    include: { course: true },
  })
  return NextResponse.json(deadlines)
}

export async function POST(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const body = await req.json()
  if (body.courseId) {
    const course = await db.course.findFirst({ where: { id: body.courseId, workspaceId }, select: { id: true } })
    if (!course) return notFoundJson()
  }
  const deadline = await db.academicDeadline.create({ data: { ...body, id: undefined, workspaceId } })
  return NextResponse.json(deadline, { status: 201 })
}
