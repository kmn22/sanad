import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateComplianceSchema } from '@/lib/validations'
import { getAuthContext, getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canWrite, denyUnless, enforceMutationBudget, legalHoldBlock } from '@/lib/auth/capabilities'
import { logError } from '@/lib/observability'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { id } = await params
  const item = await db.complianceItem.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!item) return notFoundJson()
  return NextResponse.json(item)
}

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
    const rawBody = await req.json()
    const parsed = updateComplianceSchema.parse(rawBody)
    const existing = await db.complianceItem.findFirst({ where: { id, workspaceId, deletedAt: null }, select: { id: true } })
    if (!existing) return notFoundJson()

    const updated = await db.complianceItem.update({
      where: { id },
      data: parsed,
    })
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    logError(err, { req, msg: 'Failed to update compliance item', route: 'PATCH /api/compliance/[id]' })
    return NextResponse.json({ error: 'Failed to update compliance item' }, { status: 500 })
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
  const hold = await legalHoldBlock(auth.workspaceId, 'ComplianceItem', id)
  if (hold) return hold
  const result = await db.complianceItem.updateMany({ where: { id, workspaceId, deletedAt: null }, data: { deletedAt: new Date() } })
  if (!result.count) return notFoundJson()
  return NextResponse.json({ ok: true })
}
