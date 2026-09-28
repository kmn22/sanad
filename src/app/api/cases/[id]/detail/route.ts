import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { requestIp, writeDataAccess } from '@/lib/audit'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const workspaceId = auth.workspaceId
  const { id } = await params
  const caseData = await db.legalCase.findFirst({
    where: { id, workspaceId },
    include: {
      client: true,
      timeEntries: { where: { workspaceId }, orderBy: { date: 'desc' }, include: { invoice: { select: { id: true, number: true } } } },
      communications: {
        include: { client: { select: { name: true } } },
        orderBy: { date: 'desc' },
        take: 20,
      },
      invoices: { where: { workspaceId }, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!caseData) return notFoundJson()
  await writeDataAccess({ workspaceId, userId: auth.userId, action: 'view', entityType: 'LegalCase', entityId: id, ipAddress: requestIp(req) })

  const tasks = await db.task.findMany({
    where: { caseId: id, workspaceId },
    orderBy: { dueDate: 'asc' },
  })
  const documents = await db.legalDocument.findMany({
    where: { caseId: id, workspaceId },
    orderBy: { updatedAt: 'desc' },
  })

  const billableSec = caseData.timeEntries.filter((t) => t.billable).reduce((s, t) => s + t.durationSec, 0)
  const billableSAR = caseData.timeEntries
    .filter((t) => t.billable)
    .reduce((s, t) => s + (t.durationSec / 3600) * (t.hourlyRate || 0), 0)
  const uninvoicedSAR = caseData.timeEntries
    .filter((t) => t.billable && !t.invoiced)
    .reduce((s, t) => s + (t.durationSec / 3600) * (t.hourlyRate || 0), 0)

  return NextResponse.json({
    ...caseData,
    tasks,
    documents,
    stats: {
      billableSec,
      billableSAR,
      uninvoicedSAR,
      invoicedSAR: billableSAR - uninvoicedSAR,
      totalCommunications: caseData.communications.length,
      totalInvoices: caseData.invoices.length,
      openTasks: tasks.filter((t) => t.status !== 'done').length,
    },
  })
}
