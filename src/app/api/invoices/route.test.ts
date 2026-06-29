import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => import('@/lib/__mocks__/db'))

import { db } from '@/lib/db'
import { GET, POST } from './route'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/invoices', () => {
  it('returns all invoices', async () => {
    const mockInvoices = [
      { id: '1', number: 'INV-2026-001', total: 1150, status: 'draft' },
      { id: '2', number: 'INV-2026-002', total: 2300, status: 'paid' },
    ]
    vi.mocked(db.invoice.findMany).mockResolvedValue(mockInvoices as any)

    const res = await GET()
    const data = await res.json()

    expect(data).toHaveLength(2)
    expect(data[0].number).toBe('INV-2026-001')
    expect(db.invoice.findMany).toHaveBeenCalledOnce()
  })

  it('returns empty array when no invoices exist', async () => {
    vi.mocked(db.invoice.findMany).mockResolvedValue([])

    const res = await GET()
    const data = await res.json()

    expect(data).toHaveLength(0)
  })
})

describe('POST /api/invoices', () => {
  it('creates invoice with calculated VAT', async () => {
    const timeEntries = [
      { id: 'te1', durationSec: 3600, hourlyRate: 500, billable: true },
      { id: 'te2', durationSec: 7200, hourlyRate: 500, billable: true },
    ]
    vi.mocked(db.timeEntry.findMany).mockResolvedValue(timeEntries as any)
    vi.mocked(db.invoice.count).mockResolvedValue(0)
    ;(db.invoice.create as any).mockImplementation(({ data }: any) =>
      Promise.resolve({ id: 'inv-1', ...data })
    )

    const body = {
      timeEntryIds: ['te1', 'te2'],
      clientId: 'client-1',
      caseId: 'case-1',
      dueDate: '2026-07-15',
      notes: 'Test invoice',
    }

    const req = new NextRequest('http://localhost/api/invoices', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const res = await POST(req)
    const data = await res.json()

    // 1h * 500 + 2h * 500 = 1500 subtotal
    expect(data.subtotal).toBe(1500)
    // 15% VAT
    expect(data.vatRate).toBe(15)
    expect(data.vatAmount).toBe(225)
    expect(data.total).toBe(1725)
    expect(data.number).toBe('INV-2026-001')
    expect(data.status).toBe('draft')
  })

  it('generates sequential invoice numbers', async () => {
    vi.mocked(db.timeEntry.findMany).mockResolvedValue([])
    vi.mocked(db.invoice.count).mockResolvedValue(5)
    ;(db.invoice.create as any).mockImplementation(({ data }: any) =>
      Promise.resolve({ id: 'inv-1', ...data })
    )

    const req = new NextRequest('http://localhost/api/invoices', {
      method: 'POST',
      body: JSON.stringify({ timeEntryIds: [] }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(data.number).toBe('INV-2026-006')
  })

  it('marks time entries as invoiced', async () => {
    vi.mocked(db.timeEntry.findMany).mockResolvedValue([
      { id: 'te1', durationSec: 3600, hourlyRate: 100 },
    ] as any)
    vi.mocked(db.invoice.count).mockResolvedValue(0)
    ;(db.invoice.create as any).mockImplementation(({ data }: any) =>
      Promise.resolve({ id: 'inv-new', ...data })
    )

    const req = new NextRequest('http://localhost/api/invoices', {
      method: 'POST',
      body: JSON.stringify({ timeEntryIds: ['te1'] }),
    })

    await POST(req)

    expect(db.timeEntry.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['te1'] } },
      data: { invoiced: true, invoiceId: 'inv-new' },
    })
  })

  it('handles zero-rate time entries', async () => {
    vi.mocked(db.timeEntry.findMany).mockResolvedValue([
      { id: 'te1', durationSec: 3600, hourlyRate: 0 },
    ] as any)
    vi.mocked(db.invoice.count).mockResolvedValue(0)
    ;(db.invoice.create as any).mockImplementation(({ data }: any) =>
      Promise.resolve({ id: 'inv-1', ...data })
    )

    const req = new NextRequest('http://localhost/api/invoices', {
      method: 'POST',
      body: JSON.stringify({ timeEntryIds: ['te1'] }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(data.subtotal).toBe(0)
    expect(data.vatAmount).toBe(0)
    expect(data.total).toBe(0)
  })

  it('handles null hourly rate', async () => {
    vi.mocked(db.timeEntry.findMany).mockResolvedValue([
      { id: 'te1', durationSec: 3600, hourlyRate: null },
    ] as any)
    vi.mocked(db.invoice.count).mockResolvedValue(0)
    ;(db.invoice.create as any).mockImplementation(({ data }: any) =>
      Promise.resolve({ id: 'inv-1', ...data })
    )

    const req = new NextRequest('http://localhost/api/invoices', {
      method: 'POST',
      body: JSON.stringify({ timeEntryIds: ['te1'] }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(data.subtotal).toBe(0)
    expect(data.total).toBe(0)
  })
})
