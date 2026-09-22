import { describe, it, expect } from 'vitest'
import { generateZatcaQr } from '../src/lib/zatca'

describe('ZATCA Phase 1 E-Invoicing QR Code Generator', () => {
  it('generates a valid Base64 TLV string with all required tags', () => {
    const seller = 'شركة سند للمحاماة'
    const vatNumber = '310123456700003'
    const timestamp = '2026-09-22T10:00:00Z'
    const total = 11500.0
    const vat = 1500.0

    const qrBase64 = generateZatcaQr(seller, vatNumber, timestamp, total, vat)
    expect(qrBase64).toBeDefined()
    expect(typeof qrBase64).toBe('string')
    expect(qrBase64.length).toBeGreaterThan(0)

    // Decode Base64 and parse TLV structure
    const buffer = Buffer.from(qrBase64, 'base64')
    let offset = 0
    const parsedTags: Record<number, string> = {}

    while (offset < buffer.length) {
      const tag = buffer[offset]
      const len = buffer[offset + 1]
      const value = buffer.subarray(offset + 2, offset + 2 + len).toString('utf-8')
      parsedTags[tag] = value
      offset += 2 + len
    }

    expect(parsedTags[1]).toBe(seller)
    expect(parsedTags[2]).toBe(vatNumber)
    expect(parsedTags[3]).toBe(timestamp)
    expect(parsedTags[4]).toBe('11500.00')
    expect(parsedTags[5]).toBe('1500.00')
  })

  it('handles numeric string inputs correctly', () => {
    const qr = generateZatcaQr('Office', '300000000000003', '2026-01-01T00:00:00Z', '500', '75')
    const buffer = Buffer.from(qr, 'base64')
    expect(buffer.length).toBeGreaterThan(10)
  })
})
