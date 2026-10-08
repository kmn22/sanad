import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canAccessCase, canWrite, denyUnless, enforceMutationBudget, caseLinkedAccessWhere } from '@/lib/auth/capabilities'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const workspaceId = auth.workspaceId
  const entries = await db.timeEntry.findMany({
    where: { workspaceId, deletedAt: null, ...caseLinkedAccessWhere(auth) },
    orderBy: { date: 'desc' },
    take: 50,
    include: { case: true },
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    const denied = denyUnless(auth, canWrite(auth))
    if (denied) return denied
    const budgeted = await enforceMutationBudget(auth)
    if (budgeted) return budgeted
    const workspaceId = auth.workspaceId
    const body = await req.json()
    const { caseId, description, durationSec, billable, hourlyRate, invoiced, invoiceId, sessionType, date } = body
    if (caseId) {
      const legalCase = await db.legalCase.findFirst({ where: { id: caseId, workspaceId, deletedAt: null }, select: { id: true } })
      if (!legalCase || !(await canAccessCase(auth, legalCase.id))) return notFoundJson()
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
