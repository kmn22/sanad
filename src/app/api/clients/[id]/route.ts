import { NextRequest, NextResponse } from 'next/server'
import { getTenantDb } from '@/lib/db'
import { updateClientSchema } from '@/lib/validations'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { caseAccessWhere, caseLinkedAccessWhere } from '@/lib/auth/capabilities'
import { canWrite, denyUnless, enforceMutationBudget, legalHoldBlock } from '@/lib/auth/capabilities'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const tdb = getTenantDb(auth)
  const workspaceId = auth.workspaceId
  const { id } = await params
  const client = await tdb.client.findFirst({
    where: { id, workspaceId, deletedAt: null },
    include: {
      cases: { where: { workspaceId, orgId: auth.orgId, deletedAt: null, ...caseAccessWhere(auth) }, orderBy: { updatedAt: 'desc' } },
      documents: { where: { workspaceId, deletedAt: null, ...caseLinkedAccessWhere(auth) }, orderBy: { updatedAt: 'desc' } },
      communications: { where: { workspaceId, deletedAt: null, ...caseLinkedAccessWhere(auth) }, orderBy: { date: 'desc' } },
      invoices: { where: { workspaceId, deletedAt: null, ...caseLinkedAccessWhere(auth) }, orderBy: { createdAt: 'desc' } },
    },
  })
  if (!client) return notFoundJson()
  return NextResponse.json(client)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    const denied = denyUnless(auth, canWrite(auth))
    if (denied) return denied
    const budgeted = await enforceMutationBudget(auth)
    if (budgeted) return budgeted
    const tdb = getTenantDb(auth)
    const workspaceId = auth.workspaceId
    const { id } = await params
    const parsed = updateClientSchema.parse(await req.json())
    const existing = await tdb.client.findFirst({ where: { id, workspaceId, deletedAt: null }, select: { id: true } })
    if (!existing) return notFoundJson()
    const updated = await tdb.client.update({ where: { id }, data: parsed })
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const denied = denyUnless(auth, canWrite(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  const tdb = getTenantDb(auth)
  const workspaceId = auth.workspaceId
  const { id } = await params
  const hold = await legalHoldBlock(auth.workspaceId, 'Client', id)
  if (hold) return hold
  const result = await tdb.client.updateMany({ where: { id, workspaceId, deletedAt: null }, data: { deletedAt: new Date() } })
  if (!result.count) return notFoundJson()
  return NextResponse.json({ ok: true })
}
