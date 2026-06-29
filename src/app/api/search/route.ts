import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/search?q=query — global search across all entities
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || ''

    if (q.length < 2) {
      return NextResponse.json({ results: [], total: 0 })
    }

    const [clients, cases, documents, invoices, communications, tasks, compliance, terms, casebook] = await Promise.all([
      db.client.findMany({
        where: {
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
      db.legalCase.findMany({
        where: {
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
      db.legalDocument.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { parties: { contains: q } },
            { notes: { contains: q } },
          ],
        },
        take: 5,
      }),
      db.invoice.findMany({
        where: {
          OR: [
            { number: { contains: q } },
            { notes: { contains: q } },
            { client: { name: { contains: q } } },
          ],
        },
        take: 5,
        include: { client: { select: { name: true } } },
      }),
      db.communication.findMany({
        where: {
          OR: [
            { subject: { contains: q } },
            { body: { contains: q } },
            { client: { name: { contains: q } } },
          ],
        },
        take: 5,
        include: { client: { select: { name: true } } },
      }),
      db.task.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: 5,
      }),
      db.complianceItem.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { entityName: { contains: q } },
            { notes: { contains: q } },
          ],
        },
        take: 5,
      }),
      db.legalTerm.findMany({
        where: {
          OR: [
            { term: { contains: q } },
            { definition: { contains: q } },
          ],
        },
        take: 5,
      }),
      db.caseEntry.findMany({
        where: {
          OR: [
            { caseName: { contains: q } },
            { principle: { contains: q } },
            { citation: { contains: q } },
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
      ...terms.map((t) => ({ type: 'term', id: t.id, title: t.term, subtitle: t.definition.slice(0, 80) + (t.definition.length > 80 ? '...' : ''), view: 'terms' })),
      ...casebook.map((c) => ({ type: 'casebook', id: c.id, title: c.caseName, subtitle: c.principle.slice(0, 80) + (c.principle.length > 80 ? '...' : ''), view: 'casebook' })),
    ]

    return NextResponse.json({ results, total: results.length })
  } catch (error) {
    console.error('GET /api/search failed:', error)
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 })
  }
}
