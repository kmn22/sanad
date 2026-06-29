import { describe, it, expect } from 'vitest'
import { generateZatcaQr } from './zatca'

describe('generateZatcaQr', () => {
  it('generates a non-empty base64 string', () => {
    const result = generateZatcaQr(
      'Sanad Legal',
      '300000000000003',
      '2026-06-15T12:00:00Z',
      1500,
      225
    )
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('produces valid base64 output', () => {
    const result = generateZatcaQr(
      'Test Seller',
      '300000000000003',
      '2026-01-01T00:00:00Z',
      100,
      15
    )
    const decoded = Buffer.from(result, 'base64')
    expect(decoded.length).toBeGreaterThan(0)
  })

  it('encodes TLV tags correctly', () => {
    const result = generateZatcaQr(
      'ABC',
      '123',
      '2026-01-01T00:00:00Z',
      100,
      15
    )
    const decoded = Buffer.from(result, 'base64')

    // Tag 1 (seller name): tag=1, len=3, val=ABC
    expect(decoded[0]).toBe(1)
    expect(decoded[1]).toBe(3)
    expect(decoded.toString('utf8', 2, 5)).toBe('ABC')

    // Tag 2 (VAT number): tag=2, len=3, val=123
    expect(decoded[5]).toBe(2)
    expect(decoded[6]).toBe(3)
    expect(decoded.toString('utf8', 7, 10)).toBe('123')
  })

  it('formats amounts to 2 decimal places', () => {
    const result = generateZatcaQr(
      'S',
      'V',
      'T',
      99.999,
      14.5
    )
    const decoded = Buffer.from(result, 'base64')

    // Find tag 4 (total amount) - after tags 1, 2, 3
    // Tag1: 1+1+1=3, Tag2: 1+1+1=3, Tag3: 1+1+1=3 => offset 9
    let offset = 0
    for (let tag = 1; tag <= 3; tag++) {
      offset += 2 + decoded[offset + 1]
    }
    // Tag 4
    expect(decoded[offset]).toBe(4)
    const totalLen = decoded[offset + 1]
    const totalVal = decoded.toString('utf8', offset + 2, offset + 2 + totalLen)
    expect(totalVal).toBe('100.00')

    // Tag 5
    offset += 2 + totalLen
    expect(decoded[offset]).toBe(5)
    const vatLen = decoded[offset + 1]
    const vatVal = decoded.toString('utf8', offset + 2, offset + 2 + vatLen)
    expect(vatVal).toBe('14.50')
  })

  it('handles string amounts', () => {
    const result = generateZatcaQr(
      'Seller',
      '300000000000003',
      '2026-06-15T12:00:00Z',
      '1500.50',
      '225.08'
    )
    const decoded = Buffer.from(result, 'base64')
    expect(decoded.length).toBeGreaterThan(0)

    // Verify total is formatted to 2 decimal places
    let offset = 0
    for (let tag = 1; tag <= 3; tag++) {
      offset += 2 + decoded[offset + 1]
    }
    const totalLen = decoded[offset + 1]
    const totalVal = decoded.toString('utf8', offset + 2, offset + 2 + totalLen)
    expect(totalVal).toBe('1500.50')
  })

  it('handles Arabic seller names', () => {
    const result = generateZatcaQr(
      'مكتب سند القانوني',
      '300000000000003',
      '2026-06-15T12:00:00Z',
      5000,
      750
    )
    const decoded = Buffer.from(result, 'base64')

    expect(decoded[0]).toBe(1) // Tag 1
    const nameLen = decoded[1]
    const name = decoded.toString('utf8', 2, 2 + nameLen)
    expect(name).toBe('مكتب سند القانوني')
  })

  it('produces deterministic output for the same inputs', () => {
    const args = ['Seller', '123456', '2026-01-01T00:00:00Z', 100, 15] as const
    const r1 = generateZatcaQr(...args)
    const r2 = generateZatcaQr(...args)
    expect(r1).toBe(r2)
  })

  it('produces different output for different inputs', () => {
    const r1 = generateZatcaQr('A', '1', 'T', 100, 15)
    const r2 = generateZatcaQr('B', '2', 'T', 200, 30)
    expect(r1).not.toBe(r2)
  })
})
