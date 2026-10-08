import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canWriteAcademic, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const denied = denyUnless(auth, canWriteAcademic(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  const workspaceId = auth.workspaceId
  const { id } = await params
  const existing = await db.academicDeadline.findFirst({ where: { id, workspaceId }, select: { id: true } })
  if (!existing) return notFoundJson()
  const body = await req.json()
  if (body.courseId) {
    const course = await db.course.findFirst({ where: { id: body.courseId, workspaceId }, select: { id: true } })
    if (!course) return notFoundJson()
  }
  const updated = await db.academicDeadline.update({ where: { id }, data: { ...body, id: undefined, workspaceId: undefined } })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const denied = denyUnless(auth, canWriteAcademic(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  const workspaceId = auth.workspaceId
  const { id } = await params
  const result = await db.academicDeadline.deleteMany({ where: { id, workspaceId } })
  if (!result.count) return notFoundJson()
  return NextResponse.json({ ok: true })
}
