import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const entries = await db.timeEntry.findMany({
    where: { workspaceId },
    orderBy: { date: 'desc' },
    take: 50,
    include: { case: true },
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getSessionWorkspaceId()
    if (!workspaceId) return unauthorizedJson()
    const body = await req.json()
    const { caseId, description, durationSec, billable, hourlyRate, invoiced, invoiceId, sessionType, date } = body
    if (caseId) {
      const legalCase = await db.legalCase.findFirst({ where: { id: caseId, workspaceId }, select: { id: true } })
      if (!legalCase) return notFoundJson()
    }
    if (invoiceId) {
      const invoice = await db.invoice.findFirst({ where: { id: invoiceId, workspaceId }, select: { id: true } })
      if (!invoice) return notFoundJson()
    }
    const te = await db.timeEntry.create({
      data: {
        description: description || 'جلسة عمل',
        durationSec: Number(durationSec) || 0,
        caseId: caseId || null,
        billable: Boolean(billable),
        hourlyRate: hourlyRate !== undefined && hourlyRate !== null ? Number(hourlyRate) : null,
        invoiced: Boolean(invoiced),
        invoiceId: invoiceId || null,
        sessionType: sessionType || 'focus',
        date: date ? new Date(date) : new Date(),
        workspaceId,
      },
    })
    return NextResponse.json(te)
  } catch (error) {
    console.error('Time entry creation error:', error)
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 })
  }
}
