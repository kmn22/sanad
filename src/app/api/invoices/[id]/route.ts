import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invoicePatchSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const parsed = invoicePatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const data = { ...parsed.data } as Record<string, unknown>

  // If marking as paid, set paidAt + paidAmount
  if (data.status === 'paid' && !data.paidAt) {
    data.paidAt = new Date().toISOString()
    const invoice = await db.invoice.findUnique({ where: { id } })
    if (invoice) data.paidAmount = invoice.total
  }

  const updated = await db.invoice.update({ where: { id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Unlink time entries first
  await db.timeEntry.updateMany({ where: { invoiceId: id }, data: { invoiced: false, invoiceId: null } })
  await db.invoice.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
