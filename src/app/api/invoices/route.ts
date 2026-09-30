import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { parsePagination, paginatedResponse } from '@/lib/http'

export async function GET(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { limit, cursor } = parsePagination(new URL(req.url))
  const [rows, total] = await Promise.all([
    db.invoice.findMany({
      where: { workspaceId },
      include: {
        client: { select: { id: true, name: true, company: true } },
        case: { select: { id: true, title: true } },
        _count: { select: { timeEntries: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    db.invoice.count({ where: { workspaceId } }),
  ])
  return NextResponse.json(paginatedResponse(rows, limit, { total }))
}

export async function POST(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const body = await req.json()
  const { timeEntryIds, clientId, caseId, dueDate, notes } = body
  const entryIds = Array.isArray(timeEntryIds) ? timeEntryIds : []

  if (clientId) {
    const client = await db.client.findFirst({ where: { id: clientId, workspaceId }, select: { id: true } })
    if (!client) return notFoundJson()
  }
  if (caseId) {
    const legalCase = await db.legalCase.findFirst({ where: { id: caseId, workspaceId }, select: { id: true } })
    if (!legalCase) return notFoundJson()
  }

  // Fetch time entries
  const timeEntries = await db.timeEntry.findMany({
    where: { id: { in: entryIds }, workspaceId },
  })
  if (timeEntries.length !== new Set(entryIds).size) return notFoundJson()

  const subtotal = timeEntries.reduce((s, t) => s + (t.durationSec / 3600) * (t.hourlyRate || 0), 0)
  const vatAmount = subtotal * 0.15
  const total = subtotal + vatAmount

  // Generate invoice number — use current year so it rolls over correctly.
  // NOTE: a race between concurrent requests can produce the same number; the
  // DB @unique constraint on `number` will catch it and return a 500. A future
  // improvement is to use a DB sequence or a SELECT FOR UPDATE inside the tx.
  const year = new Date().getFullYear()
  const count = await db.invoice.count({ where: { workspaceId } })
  const number = `INV-${year}-${(count + 1).toString().padStart(3, '0')}`

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
      workspaceId,
    },
  })

  // Link time entries to invoice
  await db.timeEntry.updateMany({
    where: { id: { in: entryIds }, workspaceId },
    data: { invoiced: true, invoiceId: invoice.id },
  })

  return NextResponse.json(invoice)
}
