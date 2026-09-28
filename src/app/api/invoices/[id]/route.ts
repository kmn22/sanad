import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateInvoiceSchema } from '@/lib/validations'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const workspaceId = await getSessionWorkspaceId()
    if (!workspaceId) return unauthorizedJson()
    const { id } = await params
    const parsed = updateInvoiceSchema.parse(await req.json())
    const invoice = await db.invoice.findFirst({ where: { id, workspaceId } })
    if (!invoice) return notFoundJson()

    if (parsed.status === 'paid' && !parsed.paidAt) {
      parsed.paidAt = new Date()
      parsed.paidAmount = invoice.total
    }

    const updated = await db.invoice.update({ where: { id }, data: parsed })
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { id } = await params
  const invoice = await db.invoice.findFirst({ where: { id, workspaceId }, select: { id: true } })
  if (!invoice) return notFoundJson()
  await db.$transaction([
    db.timeEntry.updateMany({ where: { invoiceId: id, workspaceId }, data: { invoiced: false, invoiceId: null } }),
    db.invoice.delete({ where: { id } }),
  ])
  return NextResponse.json({ ok: true })
}
