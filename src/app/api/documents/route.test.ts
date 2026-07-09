import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => import('@/lib/__mocks__/db'))

import { db } from '@/lib/db'
import { GET, POST } from './route'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/documents', () => {
  it('returns all documents', async () => {
    const mockDocs = [
      { id: '1', title: 'NDA Agreement', docType: 'nda', status: 'active' },
    ]
    vi.mocked(db.legalDocument.findMany).mockResolvedValue(mockDocs as any)

    const res = await GET()
    const data = await res.json()

    expect(data).toHaveLength(1)
    expect(data[0].title).toBe('NDA Agreement')
  })
})

describe('POST /api/documents', () => {
  it('creates a document and returns it', async () => {
    const docData = {
      title: 'Employment Contract',
      docType: 'employment',
      status: 'draft',
      parties: 'Company A ↔ Employee B',
    }
    vi.mocked(db.legalDocument.create).mockResolvedValue({
      id: 'doc-1',
      ...docData,
      expiryDate: null,
    } as any)

    const req = new NextRequest('http://localhost/api/documents', {
      method: 'POST',
      body: JSON.stringify(docData),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(data.title).toBe('Employment Contract')
    expect(db.legalDocument.create).toHaveBeenCalledOnce()
  })

  it('auto-generates follow-up task when NDA is sent', async () => {
    const doc = {
      id: 'doc-nda',
      title: 'NDA — TECO',
      docType: 'nda',
      status: 'sent',
      expiryDate: null,
    }
    vi.mocked(db.legalDocument.create).mockResolvedValue(doc as any)
    vi.mocked(db.task.create).mockResolvedValue({} as any)

    const req = new NextRequest('http://localhost/api/documents', {
      method: 'POST',
      body: JSON.stringify({ title: 'NDA — TECO', docType: 'nda', status: 'sent', parties: 'A ↔ B' }),
    })

    await POST(req)

    expect(db.task.create).toHaveBeenCalledOnce()
    const taskData = vi.mocked(db.task.create).mock.calls[0][0].data
    expect(taskData.title).toContain('Follow up')
    expect(taskData.title).toContain('NDA — TECO')
    expect(taskData.priority).toBe('high')
    expect(taskData.autoGen).toBe(true)
    expect(taskData.status).toBe('todo')
  })

  it('does not auto-generate task for NDA in draft status', async () => {
    const doc = {
      id: 'doc-nda',
      title: 'NDA Draft',
      docType: 'nda',
      status: 'draft',
      expiryDate: null,
    }
    vi.mocked(db.legalDocument.create).mockResolvedValue(doc as any)

    const req = new NextRequest('http://localhost/api/documents', {
      method: 'POST',
      body: JSON.stringify({ title: 'NDA Draft', docType: 'nda', status: 'draft', parties: 'A ↔ B' }),
    })

    await POST(req)

    expect(db.task.create).not.toHaveBeenCalled()
  })

  it('auto-generates renewal task for employment contract with future expiry', async () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)

    const doc = {
      id: 'doc-emp',
      title: 'Employment Contract — Ahmad',
      docType: 'employment',
      status: 'active',
      expiryDate: futureDate,
    }
    vi.mocked(db.legalDocument.create).mockResolvedValue(doc as any)
    vi.mocked(db.task.create).mockResolvedValue({} as any)

    const req = new NextRequest('http://localhost/api/documents', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Employment Contract — Ahmad',
        docType: 'employment',
        status: 'active',
        parties: 'Company ↔ Ahmad',
        expiryDate: futureDate.toISOString(),
      }),
    })

    await POST(req)

    expect(db.task.create).toHaveBeenCalledOnce()
    const taskData = vi.mocked(db.task.create).mock.calls[0][0].data
    expect(taskData.title).toContain('Renew')
    expect(taskData.priority).toBe('normal')
    expect(taskData.autoGen).toBe(true)
  })

  it('auto-generates renewal task for non-compete with future expiry', async () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)

    const doc = {
      id: 'doc-nc',
      title: 'Non-Compete',
      docType: 'non_compete',
      status: 'active',
      expiryDate: futureDate,
    }
    vi.mocked(db.legalDocument.create).mockResolvedValue(doc as any)
    vi.mocked(db.task.create).mockResolvedValue({} as any)

    const req = new NextRequest('http://localhost/api/documents', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Non-Compete',
        docType: 'non_compete',
        status: 'active',
        parties: 'A ↔ B',
        expiryDate: futureDate.toISOString(),
      }),
    })

    await POST(req)

    expect(db.task.create).toHaveBeenCalledOnce()
  })

  it('does not generate renewal task for contract type other than employment/non_compete', async () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)

    const doc = {
      id: 'doc-other',
      title: 'MSA Agreement',
      docType: 'msa',
      status: 'active',
      expiryDate: futureDate,
    }
    vi.mocked(db.legalDocument.create).mockResolvedValue(doc as any)

    const req = new NextRequest('http://localhost/api/documents', {
      method: 'POST',
      body: JSON.stringify({
        title: 'MSA Agreement',
        docType: 'msa',
        status: 'active',
        parties: 'A ↔ B',
        expiryDate: futureDate.toISOString(),
      }),
    })

    await POST(req)

    expect(db.task.create).not.toHaveBeenCalled()
  })
})
