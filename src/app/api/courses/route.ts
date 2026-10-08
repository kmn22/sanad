import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, getSessionWorkspaceId, unauthorizedJson } from '@/lib/auth/workspace'
import { canWriteAcademic, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'

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
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const denied = denyUnless(auth, canWriteAcademic(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  const workspaceId = auth.workspaceId
  const body = await req.json()
  const course = await db.course.create({ data: { ...body, id: undefined, workspaceId } })
  return NextResponse.json(course, { status: 201 })
}
