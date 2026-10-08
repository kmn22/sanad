import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canAccessCase, canWrite, denyUnless, enforceMutationBudget, legalHoldBlock } from '@/lib/auth/capabilities'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const denied = denyUnless(auth, canWrite(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  const workspaceId = auth.workspaceId
  const { id } = await params
  const hold = await legalHoldBlock(auth.workspaceId, 'TimeEntry', id)
  if (hold) return hold
  const entry = await db.timeEntry.findFirst({ where: { id, workspaceId, deletedAt: null }, select: { id: true, caseId: true } })
  if (!entry || (entry.caseId && !(await canAccessCase(auth, entry.caseId)))) return notFoundJson()
  await db.timeEntry.update({ where: { id }, data: { deletedAt: new Date() } })
  return NextResponse.json({ ok: true })
}
