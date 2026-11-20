import { NextRequest, NextResponse } from 'next/server'
import { getTenantDb } from '@/lib/db'
import { communicationWorkspaceWhere, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import { caseAccessWhere, caseLinkedAccessWhere } from '@/lib/auth/capabilities'

// GET /api/search?q=query — global search across all entities
export async function GET(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const tdb = getTenantDb(auth)
  const workspaceId = auth.workspaceId
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || ''

  if (q.length < 2) {
    return NextResponse.json({ results: [], total: 0 })
  }

  const [clients, cases, documents, invoices, communications, tasks, compliance] = await Promise.all([
    tdb.client.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        OR: [
          { name: { contains: q } },
          { phone: { contains: q } },
          { email: { contains: q } },
          { nationalId: { contains: q } },
          { company: { contains: q } },
        ],
      },
      take: 5,
      select: { id: true, name: true, type: true, phone: true, email: true, company: true },
    }),
    tdb.legalCase.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        ...caseAccessWhere(auth),
        OR: [
          { title: { contains: q } },
          { clientName: { contains: q } },
          { caseNumber: { contains: q } },
          { court: { contains: q } },
          { opposingParty: { contains: q } },
          { notes: { contains: q } },
        ],
      },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
    tdb.legalDocument.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        ...caseLinkedAccessWhere(auth),
        OR: [
          { title: { contains: q } },
          { parties: { contains: q } },
          { notes: { contains: q } },
        ],
      },
      take: 5,
    }),
    tdb.invoice.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        ...caseLinkedAccessWhere(auth),
        OR: [
          { number: { contains: q } },
          { notes: { contains: q } },
          { client: { name: { contains: q } } },
        ],
      },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
    tdb.communication.findMany({
      where: {
        AND: [
          communicationWorkspaceWhere(workspaceId),
          { deletedAt: null },
          caseLinkedAccessWhere(auth),
          {
            OR: [
              { subject: { contains: q } },
              { body: { contains: q } },
              { client: { name: { contains: q } } },
            ],
          },
        ],
      },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
    tdb.task.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        ...caseLinkedAccessWhere(auth),
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
        ],
      },
      take: 5,
    }),
    tdb.complianceItem.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        OR: [
          { title: { contains: q } },
          { entityName: { contains: q } },
          { notes: { contains: q } },
        ],
      },
      take: 5,
    }),
  ])

  const results = [
    ...clients.map((c) => ({ type: 'client', id: c.id, title: c.name, subtitle: c.company || c.email || c.phone || '', view: 'clients' })),
    ...cases.map((c) => ({ type: 'case', id: c.id, title: c.title, subtitle: c.client?.name || c.clientName || '', view: 'cases' })),
    ...documents.map((d) => ({ type: 'document', id: d.id, title: d.title, subtitle: d.parties, view: 'documents' })),
    ...invoices.map((i) => ({ type: 'invoice', id: i.id, title: i.number, subtitle: i.client?.name || '', view: 'invoices' })),
    ...communications.map((c) => ({ type: 'communication', id: c.id, title: c.subject, subtitle: c.client?.name || '', view: 'communications' })),
    ...tasks.map((t) => ({ type: 'task', id: t.id, title: t.title, subtitle: t.description || '', view: 'tasks' })),
    ...compliance.map((c) => ({ type: 'compliance', id: c.id, title: `${c.title} — ${c.entityName}`, subtitle: c.notes || '', view: 'compliance' })),
  ]

  return NextResponse.json({ results, total: results.length })
}
