import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionWorkspaceId, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const courses = await db.course.findMany({
    where: { workspaceId },
    include: { lectures: { where: { workspaceId } }, deadlines: { where: { workspaceId } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(courses)
}

export async function POST(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const body = await req.json()
  const course = await db.course.create({ data: { ...body, id: undefined, workspaceId } })
  return NextResponse.json(course, { status: 201 })
}
