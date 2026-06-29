import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => import('@/lib/__mocks__/db'))

import { db } from '@/lib/db'
import { GET } from './route'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/search', () => {
  it('returns empty results for short query (< 2 chars)', async () => {
    const req = new NextRequest('http://localhost/api/search?q=a')

    const res = await GET(req)
    const data = await res.json()

    expect(data.results).toHaveLength(0)
    expect(data.total).toBe(0)
  })

  it('returns empty results for empty query', async () => {
    const req = new NextRequest('http://localhost/api/search?q=')

    const res = await GET(req)
    const data = await res.json()

    expect(data.results).toHaveLength(0)
    expect(data.total).toBe(0)
  })

  it('returns empty results for missing query parameter', async () => {
    const req = new NextRequest('http://localhost/api/search')

    const res = await GET(req)
    const data = await res.json()

    expect(data.results).toHaveLength(0)
    expect(data.total).toBe(0)
  })

  it('searches across all entity types', async () => {
    vi.mocked(db.client.findMany).mockResolvedValue([
      { id: 'c1', name: 'Ahmad Corp', type: 'corporate', phone: null, email: null, company: 'Ahmad Corp' },
    ] as any)
    vi.mocked(db.legalCase.findMany).mockResolvedValue([
      { id: 'case1', title: 'Ahmad vs State', client: { name: 'Ahmad' }, clientName: 'Ahmad' },
    ] as any)
    vi.mocked(db.legalDocument.findMany).mockResolvedValue([])
    vi.mocked(db.invoice.findMany).mockResolvedValue([])
    vi.mocked(db.communication.findMany).mockResolvedValue([])
    vi.mocked(db.task.findMany).mockResolvedValue([])
    vi.mocked(db.complianceItem.findMany).mockResolvedValue([])
    vi.mocked(db.legalTerm.findMany).mockResolvedValue([])
    vi.mocked(db.caseEntry.findMany).mockResolvedValue([])

    const req = new NextRequest('http://localhost/api/search?q=Ahmad')

    const res = await GET(req)
    const data = await res.json()

    expect(data.total).toBe(2)
    expect(data.results[0].type).toBe('client')
    expect(data.results[0].view).toBe('clients')
    expect(data.results[1].type).toBe('case')
    expect(data.results[1].view).toBe('cases')
  })

  it('maps client results correctly', async () => {
    vi.mocked(db.client.findMany).mockResolvedValue([
      { id: 'c1', name: 'Test Client', type: 'individual', phone: '+966555', email: 'test@example.com', company: null },
    ] as any)
    // Mock all other models to return empty
    vi.mocked(db.legalCase.findMany).mockResolvedValue([])
    vi.mocked(db.legalDocument.findMany).mockResolvedValue([])
    vi.mocked(db.invoice.findMany).mockResolvedValue([])
    vi.mocked(db.communication.findMany).mockResolvedValue([])
    vi.mocked(db.task.findMany).mockResolvedValue([])
    vi.mocked(db.complianceItem.findMany).mockResolvedValue([])
    vi.mocked(db.legalTerm.findMany).mockResolvedValue([])
    vi.mocked(db.caseEntry.findMany).mockResolvedValue([])

    const req = new NextRequest('http://localhost/api/search?q=Test Client')
    const res = await GET(req)
    const data = await res.json()

    expect(data.results[0]).toEqual({
      type: 'client',
      id: 'c1',
      title: 'Test Client',
      subtitle: 'test@example.com',
      view: 'clients',
    })
  })

  it('maps legal term results with truncated definition', async () => {
    const longDef = 'A'.repeat(100)
    vi.mocked(db.client.findMany).mockResolvedValue([])
    vi.mocked(db.legalCase.findMany).mockResolvedValue([])
    vi.mocked(db.legalDocument.findMany).mockResolvedValue([])
    vi.mocked(db.invoice.findMany).mockResolvedValue([])
    vi.mocked(db.communication.findMany).mockResolvedValue([])
    vi.mocked(db.task.findMany).mockResolvedValue([])
    vi.mocked(db.complianceItem.findMany).mockResolvedValue([])
    vi.mocked(db.legalTerm.findMany).mockResolvedValue([
      { id: 't1', term: 'Contract', definition: longDef },
    ] as any)
    vi.mocked(db.caseEntry.findMany).mockResolvedValue([])

    const req = new NextRequest('http://localhost/api/search?q=Contract')
    const res = await GET(req)
    const data = await res.json()

    const termResult = data.results.find((r: any) => r.type === 'term')
    expect(termResult.subtitle).toHaveLength(83) // 80 chars + '...'
    expect(termResult.subtitle.endsWith('...')).toBe(true)
  })

  it('does not truncate short definitions', async () => {
    vi.mocked(db.client.findMany).mockResolvedValue([])
    vi.mocked(db.legalCase.findMany).mockResolvedValue([])
    vi.mocked(db.legalDocument.findMany).mockResolvedValue([])
    vi.mocked(db.invoice.findMany).mockResolvedValue([])
    vi.mocked(db.communication.findMany).mockResolvedValue([])
    vi.mocked(db.task.findMany).mockResolvedValue([])
    vi.mocked(db.complianceItem.findMany).mockResolvedValue([])
    vi.mocked(db.legalTerm.findMany).mockResolvedValue([
      { id: 't1', term: 'NDA', definition: 'Non-disclosure agreement' },
    ] as any)
    vi.mocked(db.caseEntry.findMany).mockResolvedValue([])

    const req = new NextRequest('http://localhost/api/search?q=NDA')
    const res = await GET(req)
    const data = await res.json()

    const termResult = data.results.find((r: any) => r.type === 'term')
    expect(termResult.subtitle).toBe('Non-disclosure agreement')
  })

  it('maps compliance items with combined title', async () => {
    vi.mocked(db.client.findMany).mockResolvedValue([])
    vi.mocked(db.legalCase.findMany).mockResolvedValue([])
    vi.mocked(db.legalDocument.findMany).mockResolvedValue([])
    vi.mocked(db.invoice.findMany).mockResolvedValue([])
    vi.mocked(db.communication.findMany).mockResolvedValue([])
    vi.mocked(db.task.findMany).mockResolvedValue([])
    vi.mocked(db.complianceItem.findMany).mockResolvedValue([
      { id: 'comp1', title: 'Iqama Renewal', entityName: 'Mohammad', notes: null },
    ] as any)
    vi.mocked(db.legalTerm.findMany).mockResolvedValue([])
    vi.mocked(db.caseEntry.findMany).mockResolvedValue([])

    const req = new NextRequest('http://localhost/api/search?q=Iqama')
    const res = await GET(req)
    const data = await res.json()

    const compResult = data.results.find((r: any) => r.type === 'compliance')
    expect(compResult.title).toBe('Iqama Renewal — Mohammad')
    expect(compResult.subtitle).toBe('')
    expect(compResult.view).toBe('compliance')
  })

  it('trims whitespace from query', async () => {
    vi.mocked(db.client.findMany).mockResolvedValue([])
    vi.mocked(db.legalCase.findMany).mockResolvedValue([])
    vi.mocked(db.legalDocument.findMany).mockResolvedValue([])
    vi.mocked(db.invoice.findMany).mockResolvedValue([])
    vi.mocked(db.communication.findMany).mockResolvedValue([])
    vi.mocked(db.task.findMany).mockResolvedValue([])
    vi.mocked(db.complianceItem.findMany).mockResolvedValue([])
    vi.mocked(db.legalTerm.findMany).mockResolvedValue([])
    vi.mocked(db.caseEntry.findMany).mockResolvedValue([])

    const req = new NextRequest('http://localhost/api/search?q=  test  ')
    const res = await GET(req)
    const data = await res.json()

    expect(data.results).toHaveLength(0)
    expect(db.client.findMany).toHaveBeenCalled()
  })
})
