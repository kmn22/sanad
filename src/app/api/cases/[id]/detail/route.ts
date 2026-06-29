import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/cases/[id]/detail — full case detail with all related entities
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const caseData = await db.legalCase.findUnique({
      where: { id },
      include: {
        client: true,
        timeEntries: { orderBy: { date: 'desc' }, include: { invoice: { select: { id: true, number: true } } } },
        communications: {
          include: { client: { select: { name: true } } },
          orderBy: { date: 'desc' },
          take: 20,
        },
        invoices: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!caseData) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Find tasks related to this case
    const tasks = await db.task.findMany({
      where: { caseId: id },
      orderBy: { dueDate: 'asc' },
    })

    // Find documents related to this case
    const documents = await db.legalDocument.findMany({
      where: { caseId: id },
      orderBy: { updatedAt: 'desc' },
    })

    // Compute stats
    const billableSec = caseData.timeEntries
      .filter((t) => t.billable)
      .reduce((s, t) => s + t.durationSec, 0)
    const billableSAR = caseData.timeEntries
      .filter((t) => t.billable)
      .reduce((s, t) => s + (t.durationSec / 3600) * (t.hourlyRate || 0), 0)
    const uninvoicedSAR = caseData.timeEntries
      .filter((t) => t.billable && !t.invoiced)
      .reduce((s, t) => s + (t.durationSec / 3600) * (t.hourlyRate || 0), 0)
    const invoicedSAR = billableSAR - uninvoicedSAR

    return NextResponse.json({
      ...caseData,
      tasks,
      documents,
      stats: {
        billableSec,
        billableSAR,
        uninvoicedSAR,
        invoicedSAR,
        totalCommunications: caseData.communications.length,
        totalInvoices: caseData.invoices.length,
        openTasks: tasks.filter((t) => t.status !== 'done').length,
      },
    })
  } catch (error) {
    console.error('GET /api/cases/[id]/detail failed:', error)
    return NextResponse.json({ error: 'Failed to fetch case details' }, { status: 500 })
  }
}
