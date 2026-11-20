import { NextRequest, NextResponse } from 'next/server'
import { getTenantDb } from '@/lib/db'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canAccessCase } from '@/lib/auth/capabilities'
import { requestIp, writeDataAccess } from '@/lib/audit'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const workspaceId = auth.workspaceId
  const orgId = auth.orgId
  const { id } = await params
  if (!(await canAccessCase(auth, id))) return notFoundJson()

  const tdb = getTenantDb(auth)
  const caseData = await tdb.legalCase.findFirst({
    where: { id, workspaceId, orgId, deletedAt: null },
    include: {
      client: true,
      timeEntries: { where: { workspaceId, deletedAt: null }, orderBy: { date: 'desc' }, include: { invoice: { select: { id: true, number: true } } } },
      communications: {
        where: { workspaceId, deletedAt: null },
        include: { client: { select: { name: true } } },
        orderBy: { date: 'desc' },
        take: 20,
      },
      invoices: { where: { workspaceId }, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!caseData) return notFoundJson()
  await writeDataAccess({ workspaceId, userId: auth.userId, action: 'view', entityType: 'LegalCase', entityId: id, ipAddress: requestIp(req) })

  const [tasks, documents] = await Promise.all([
    tdb.task.findMany({
      where: { caseId: id, workspaceId },
      orderBy: { dueDate: 'asc' },
    }),
    tdb.legalDocument.findMany({
      where: { caseId: id, workspaceId },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  const billableSec = caseData.timeEntries.filter((t) => t.billable).reduce((s, t) => s + t.durationSec, 0)
  const billableSAR = caseData.timeEntries
    .filter((t) => t.billable)
    .reduce((s, t) => s + (t.durationSec / 3600) * Number(t.hourlyRate || 0), 0)
  const uninvoicedSAR = caseData.timeEntries
    .filter((t) => t.billable && !t.invoiced)
    .reduce((s, t) => s + (t.durationSec / 3600) * Number(t.hourlyRate || 0), 0)

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
