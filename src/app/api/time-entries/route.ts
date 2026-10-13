import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canAccessCase, canWrite, denyUnless, enforceMutationBudget, caseLinkedAccessWhere } from '@/lib/auth/capabilities'
import { logError } from '@/lib/observability'
import { createTimeEntrySchema } from '@/lib/validations'

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
    const parsed = createTimeEntrySchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
    }
    const { caseId, description, durationSec, billable, hourlyRate, invoiced, invoiceId, sessionType, date } = parsed.data
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
        durationSec,
        caseId: caseId || null,
        billable,
        hourlyRate,
        invoiced,
        invoiceId: invoiceId || null,
        sessionType,
        date,
        workspaceId,
      },
    })
    return NextResponse.json(te)
  } catch (error) {
    logError(error, { req, msg: 'Time entry creation error', route: 'POST /api/time-entries' })
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 })
  }
}
