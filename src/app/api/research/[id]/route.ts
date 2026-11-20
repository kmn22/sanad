import { NextRequest, NextResponse } from 'next/server'
import { getTenantDb } from '@/lib/db'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canAccessCase, canWriteAcademic, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'
import { updateResearchItemSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const denied = denyUnless(auth, canWriteAcademic(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  const tdb = getTenantDb(auth)
  const workspaceId = auth.workspaceId
  const { id } = await params
  const existing = await tdb.researchItem.findFirst({ where: { id, workspaceId }, select: { id: true } })
  if (!existing) return notFoundJson()
  const parsed = updateResearchItemSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
  }
  if (parsed.data.caseId) {
    const legalCase = await tdb.legalCase.findFirst({
      where: { id: parsed.data.caseId, workspaceId, orgId: auth.orgId, deletedAt: null },
      select: { id: true },
    })
    if (!legalCase || !(await canAccessCase(auth, legalCase.id))) return notFoundJson()
  }
  const item = await tdb.researchItem.update({
    where: { id },
    data: parsed.data,
  })
  return NextResponse.json({ success: true, item })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const denied = denyUnless(auth, canWriteAcademic(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  const tdb = getTenantDb(auth)
  const workspaceId = auth.workspaceId
  const { id } = await params
  const result = await tdb.researchItem.deleteMany({ where: { id, workspaceId } })
  if (!result.count) return notFoundJson()
  return NextResponse.json({ success: true })
}
