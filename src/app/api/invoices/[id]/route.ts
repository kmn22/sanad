import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateInvoiceSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rawBody = await req.json()
    const parsed = updateInvoiceSchema.parse(rawBody)

    // If marking as paid, set paidAt + paidAmount
    if (parsed.status === 'paid' && !parsed.paidAt) {
      const invoice = await db.invoice.findUnique({ where: { id } })
      if (invoice) {
        parsed.paidAt = new Date()
        parsed.paidAmount = invoice.total
      }
    }

    const updated = await db.invoice.update({ where: { id }, data: parsed })
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message || 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Unlink time entries first
  await db.timeEntry.updateMany({ where: { invoiceId: id }, data: { invoiced: false, invoiceId: null } })
  await db.invoice.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
