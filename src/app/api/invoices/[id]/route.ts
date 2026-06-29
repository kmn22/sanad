import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    // If marking as paid, set paidAt + paidAmount
    if (body.status === 'paid' && !body.paidAt) {
      body.paidAt = new Date().toISOString()
      const invoice = await db.invoice.findUnique({ where: { id } })
      if (invoice) body.paidAmount = invoice.total
    }

    const updated = await db.invoice.update({ where: { id }, data: body })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/invoices/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Unlink time entries first
    await db.timeEntry.updateMany({ where: { invoiceId: id }, data: { invoiced: false, invoiceId: null } })
    await db.invoice.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/invoices/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
