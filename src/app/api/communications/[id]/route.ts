import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communicationWorkspaceWhere, getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canAccessCase, canWrite, denyUnless, enforceMutationBudget, legalHoldBlock } from '@/lib/auth/capabilities'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const denied = denyUnless(auth, canWrite(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  const workspaceId = auth.workspaceId
  const { id } = await params
  const existing = await db.communication.findFirst({
    where: { id, ...communicationWorkspaceWhere(workspaceId), deletedAt: null },
    select: { id: true, caseId: true },
  })
  if (!existing || (existing.caseId && !(await canAccessCase(auth, existing.caseId)))) return notFoundJson()
  const body = await req.json()
  const updated = await db.communication.update({
    where: { id },
    data: {
      subject: body.subject,
      body: body.body,
      type: body.type,
      direction: body.direction,
      date: body.date ? new Date(body.date) : undefined,
      durationMin: body.durationMin ?? undefined,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const denied = denyUnless(auth, canWrite(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  const workspaceId = auth.workspaceId
  const { id } = await params
  const existing = await db.communication.findFirst({
    where: { id, ...communicationWorkspaceWhere(workspaceId), deletedAt: null },
    select: { id: true, caseId: true },
  })
  if (!existing || (existing.caseId && !(await canAccessCase(auth, existing.caseId)))) return notFoundJson()
  const hold = await legalHoldBlock(auth.workspaceId, 'Communication', id)
  if (hold) return hold
  await db.communication.update({ where: { id }, data: { deletedAt: new Date() } })
  return NextResponse.json({ ok: true })
}
