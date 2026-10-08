import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateInvoiceSchema } from '@/lib/validations'
import { forbiddenJson, getAuthContext, hasRole, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canAccessCase, legalHoldBlock } from '@/lib/auth/capabilities'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    if (!hasRole(auth, ['admin', 'workspace_owner', 'lawyer', 'staff'])) return forbiddenJson()
    const { id } = await params
    const parsed = updateInvoiceSchema.parse(await req.json())
    if ((parsed.status === 'paid' || parsed.paidAt !== undefined || parsed.paidAmount !== undefined) && !hasRole(auth, ['admin', 'workspace_owner', 'staff'])) return forbiddenJson()
    const invoice = await db.invoice.findFirst({ where: { id, workspaceId: auth.workspaceId, deletedAt: null }, select: { id: true, status: true, total: true, caseId: true } })
    if (!invoice || (invoice.caseId && !(await canAccessCase(auth, invoice.caseId)))) return notFoundJson()
    if (invoice.status === 'paid' && Object.keys(parsed).some((field) => field !== 'notes')) {
      return NextResponse.json({ error: 'Paid invoices are immutable; create a corrective document instead', code: 'PAID_INVOICE_IMMUTABLE' }, { status: 409 })
    }
    if (parsed.clientId) {
      const client = await db.client.findFirst({ where: { id: parsed.clientId, workspaceId: auth.workspaceId }, select: { id: true } })
      if (!client) return notFoundJson()
    }
    if (parsed.caseId) {
      const legalCase = await db.legalCase.findFirst({ where: { id: parsed.caseId, workspaceId: auth.workspaceId, deletedAt: null }, select: { id: true } })
      if (!legalCase || !(await canAccessCase(auth, legalCase.id))) return notFoundJson()
    }

    if (parsed.status === 'paid' && !parsed.paidAt) {
      parsed.paidAt = new Date()
      parsed.paidAmount = Number(invoice.total)
    }

    const updated = await db.$transaction(async (tx) => {
      const row = await tx.invoice.update({ where: { id }, data: parsed })
      await tx.auditLog.create({
        data: {
          workspaceId: auth.workspaceId,
          userId: auth.userId,
          action: parsed.status === 'paid' ? 'invoice.mark_paid' : 'invoice.update',
          entityType: 'Invoice',
          entityId: id,
          metadata: JSON.stringify({ fields: Object.keys(parsed) }),
        },
      })
      return row
    })
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!hasRole(auth, ['admin', 'workspace_owner'])) return forbiddenJson()
  const { id } = await params
  const invoice = await db.invoice.findFirst({ where: { id, workspaceId: auth.workspaceId, deletedAt: null }, select: { id: true, status: true } })
  if (!invoice) return notFoundJson()
  if (invoice.status === 'paid') {
    return NextResponse.json({ error: 'Paid invoices cannot be deleted; create a corrective document instead', code: 'PAID_INVOICE_IMMUTABLE' }, { status: 409 })
  }
  const hold = await legalHoldBlock(auth.workspaceId, 'Invoice', id)
  if (hold) return hold
  await db.$transaction(async (tx) => {
    await tx.timeEntry.updateMany({ where: { invoiceId: id, workspaceId: auth.workspaceId }, data: { invoiced: false, invoiceId: null } })
    await tx.invoice.update({ where: { id }, data: { deletedAt: new Date() } })
    await tx.auditLog.create({
      data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'invoice.delete', entityType: 'Invoice', entityId: id },
    })
  })
  return NextResponse.json({ ok: true })
}
