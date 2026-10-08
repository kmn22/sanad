import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateCaseSchema } from '@/lib/validations'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canAccessCase, canWrite, denyUnless, enforceMutationBudget, legalHoldBlock } from '@/lib/auth/capabilities'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    const denied = denyUnless(auth, canWrite(auth))
    if (denied) return denied
    const budgeted = await enforceMutationBudget(auth)
    if (budgeted) return budgeted
    const workspaceId = auth.workspaceId
    const { id } = await params
    const parsed = updateCaseSchema.parse(await req.json())
    const existing = await db.legalCase.findFirst({ where: { id, workspaceId, deletedAt: null }, select: { id: true } })
    if (!existing || !(await canAccessCase(auth, id))) return notFoundJson()
    if (parsed.clientId) {
      const client = await db.client.findFirst({ where: { id: parsed.clientId, workspaceId }, select: { id: true } })
      if (!client) return notFoundJson()
    }
    const updated = await db.legalCase.update({ where: { id }, data: parsed })
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 })
  }
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
  const hold = await legalHoldBlock(auth.workspaceId, 'LegalCase', id)
  if (hold) return hold
  const existing = await db.legalCase.findFirst({ where: { id, workspaceId, deletedAt: null }, select: { id: true } })
  if (!existing || !(await canAccessCase(auth, id))) return notFoundJson()
  await db.legalCase.update({ where: { id }, data: { deletedAt: new Date() } })
  return NextResponse.json({ ok: true })
}
