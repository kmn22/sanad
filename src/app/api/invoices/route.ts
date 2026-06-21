import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const invoices = await db.invoice.findMany({
    include: {
      client: { select: { id: true, name: true, company: true } },
      case: { select: { id: true, title: true } },
      _count: { select: { timeEntries: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { timeEntryIds, clientId, caseId, dueDate, notes } = body

  // Fetch time entries
  const timeEntries = await db.timeEntry.findMany({
    where: { id: { in: timeEntryIds } },
  })

  const subtotal = timeEntries.reduce((s, t) => s + (t.durationSec / 3600) * (t.hourlyRate || 0), 0)
  const vatAmount = subtotal * 0.15
  const total = subtotal + vatAmount

  // Generate invoice number
  const count = await db.invoice.count()
  const number = `INV-2026-${(count + 1).toString().padStart(3, '0')}`

  const invoice = await db.invoice.create({
    data: {
      number,
      clientId: clientId || null,
      caseId: caseId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      subtotal,
      vatRate: 15,
      vatAmount,
      total,
      notes: notes || null,
      status: 'draft',
    },
  })

  // Link time entries to invoice
  await db.timeEntry.updateMany({
    where: { id: { in: timeEntryIds } },
    data: { invoiced: true, invoiceId: invoice.id },
  })

  return NextResponse.json(invoice)
}
