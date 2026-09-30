import { describe, it, expect } from 'vitest'
import {
  generateZatcaQr,
  generateZatcaPhase2Qr,
  generateUblXml,
  calculateInvoiceHash,
  validateZatcaInvoice,
  processZatcaPhase2,
  isValidSaudiVatNumber,
  ZatcaInvoiceData,
} from '../src/lib/zatca'

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

describe('ZATCA Phase 2 E-Invoicing & Cryptographic Engine', () => {
  const sampleInvoice: ZatcaInvoiceData = {
    invoiceNumber: 'INV-2026-042',
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    issueDate: '2026-09-30',
    issueTime: '14:30:00',
    invoiceTypeCode: '388',
    subtype: '0200000',
    seller: {
      name: 'شركة سند للاستشارات القانونية',
      vatNumber: '310123456700003',
      city: 'الرياض',
      streetName: 'طريق الملك فهد',
      buildingNumber: '1234',
      postalZone: '12211',
    },
    buyer: {
      name: 'شركة الأفق للاستثمار',
      vatNumber: '300987654300003',
    },
    lineItems: [
      {
        id: 'item-1',
        name: 'صياغة عقد اندماج واستحواذ تجاري',
        quantity: 10,
        unitPrice: 1000,
        subtotal: 10000,
        vatAmount: 1500,
        total: 11500,
      },
    ],
    subtotal: 10000,
    vatAmount: 1500,
    total: 11500,
  }

  it('validates Saudi 15-digit VAT numbers correctly', () => {
    expect(isValidSaudiVatNumber('310123456700003')).toBe(true)
    expect(isValidSaudiVatNumber('300987654300003')).toBe(true)
    // Fails: doesn't start with 3
    expect(isValidSaudiVatNumber('110123456700003')).toBe(false)
    // Fails: doesn't end with 3
    expect(isValidSaudiVatNumber('310123456700004')).toBe(false)
    // Fails: 14 digits
    expect(isValidSaudiVatNumber('31012345670003')).toBe(false)
  })

  it('validates invoice business rules and totals mathematically', () => {
    const validResult = validateZatcaInvoice(sampleInvoice)
    expect(validResult.valid).toBe(true)
    expect(validResult.errors.length).toBe(0)

    // Tampered invoice with arithmetic mismatch
    const badInvoice: ZatcaInvoiceData = {
      ...sampleInvoice,
      total: 15000, // Expected 11500
    }
    const invalidResult = validateZatcaInvoice(badInvoice)
    expect(invalidResult.valid).toBe(false)
    expect(invalidResult.errors.some((e) => e.includes('إجمالي الفاتورة'))).toBe(true)
  })

  it('generates UBL 2.1 XML with all required ZATCA components', () => {
    const xml = generateUblXml(sampleInvoice)

    expect(xml).toContain('xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"')
    expect(xml).toContain('<cbc:ProfileID>reporting:1.0</cbc:ProfileID>')
    expect(xml).toContain('<cbc:ID>INV-2026-042</cbc:ID>')
    expect(xml).toContain('<cbc:UUID>123e4567-e89b-12d3-a456-426614174000</cbc:UUID>')
    expect(xml).toContain('<cbc:CompanyID>310123456700003</cbc:CompanyID>')
    expect(xml).toContain('<cbc:RegistrationName>شركة سند للاستشارات القانونية</cbc:RegistrationName>')
    expect(xml).toContain('<cbc:TaxAmount currencyID="SAR">1500.00</cbc:TaxAmount>')
    expect(xml).toContain('<cbc:PayableAmount currencyID="SAR">11500.00</cbc:PayableAmount>')
    expect(xml).toContain('<cbc:Name>صياغة عقد اندماج واستحواذ تجاري</cbc:Name>')
  })

  it('calculates reproducible SHA-256 hash digests', () => {
    const xml = generateUblXml(sampleInvoice)
    const hashA = calculateInvoiceHash(xml)
    const hashB = calculateInvoiceHash(xml)

    expect(hashA.hex).toBe(hashB.hex)
    expect(hashA.base64).toBe(hashB.base64)
    expect(hashA.hex.length).toBe(64) // 64 hex characters = 256 bits
  })

  it('generates a complete Phase 2 QR code containing Tags 1 through 7', () => {
    const xml = generateUblXml(sampleInvoice)
    const { base64: hashBase64 } = calculateInvoiceHash(xml)
    const fakeSignature = 'SIG_MEQCIB0yM4K...'

    const qrBase64 = generateZatcaPhase2Qr({
      sellerName: sampleInvoice.seller.name,
      vatNumber: sampleInvoice.seller.vatNumber,
      timestamp: '2026-09-30T14:30:00Z',
      totalAmount: sampleInvoice.total,
      vatAmount: sampleInvoice.vatAmount,
      invoiceHashBase64: hashBase64,
      digitalSignatureBase64: fakeSignature,
    })

    expect(qrBase64).toBeDefined()
    expect(qrBase64.length).toBeGreaterThan(50)

    // Decode and verify tag 6 (Invoice Hash) and tag 7 (Signature)
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

    expect(parsedTags[1]).toBe(sampleInvoice.seller.name)
    expect(parsedTags[2]).toBe(sampleInvoice.seller.vatNumber)
    expect(parsedTags[6]).toBe(hashBase64)
    expect(parsedTags[7]).toBe(fakeSignature)
  })

  it('runs the full processZatcaPhase2 pipeline end-to-end', () => {
    const result = processZatcaPhase2(sampleInvoice)

    expect(result.validation.valid).toBe(true)
    expect(result.ublXml).toContain('<cbc:ID>INV-2026-042</cbc:ID>')
    expect(result.invoiceHashHex).toHaveLength(64)
    expect(result.invoiceHashBase64).toBeDefined()
    expect(result.qrCodeBase64).toBeDefined()
    expect(result.digitalSignatureBase64).toBeDefined()
  })
})
