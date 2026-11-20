/**
 * ============================================================================
 * Maqar (مقر) External Services — ZATCA Phase-2 Electronic Invoicing Service
 * (`src/services/billing.ts`)
 * ============================================================================
 *
 * Implements Saudi ZATCA (Fatoora) Phase-2 Electronic Invoicing Stub:
 *   1. Supports both B2B Standard Tax Invoices (`0100000` — Clearance) and
 *      B2C Simplified Tax Invoices (`0200000` — Reporting) with 15% KSA VAT.
 *   2. Encodes & decodes binary TLV (Tag-Length-Value) Base64 QR Codes:
 *      - Tag 1: Seller Name
 *      - Tag 2: VAT Registration Number (15 digits starting & ending with '3')
 *      - Tag 3: Invoice Timestamp (ISO-8601)
 *      - Tag 4: Invoice Total (with VAT)
 *      - Tag 5: VAT Total
 *      - Tags 6-8: Phase-2 Cryptographic Stamp (XML SHA-256 Hash, ECDSA Sig, Public Key)
 *   3. Renders scannable SVG QR codes via `uqr`.
 */

import { createHash, createHmac, randomUUID } from 'node:crypto'
import { renderSVG } from 'uqr'

export type ZatcaInvoiceCategory = 'B2B_TAX_INVOICE' | 'B2C_SIMPLIFIED_INVOICE'

export interface ZatcaPartyDetails {
  legalName: string
  vatNumber?: string // Required 15-digit VAT number (3...3) for Seller and B2B Buyer
  crNumber?: string
  city?: string
  streetAddress?: string
  buildingNumber?: string
  postalCode?: string
}

export interface BillingLineItemInput {
  description: string
  quantity: number
  unitPriceSar: number
  vatRate?: number // Defaults to 0.15 (15% Saudi standard VAT)
}

export interface ComputedBillingLineItem {
  lineNumber: number
  description: string
  quantity: number
  unitPriceSar: number
  vatRate: number
  lineSubtotalSar: number
  lineVatSar: number
  lineTotalWithVatSar: number
}

export interface ZatcaTlvPayload {
  sellerName: string
  vatNumber: string
  timestampIso: string
  totalWithVat: string
  vatTotal: string
  invoiceHashBase64?: string
  ecdsaSignatureBase64?: string
  publicKeyBase64?: string
}

export interface GenerateZatcaInvoiceInput {
  invoiceNumber: string
  category: ZatcaInvoiceCategory
  issueTimestamp?: Date
  seller: ZatcaPartyDetails & { vatNumber: string }
  buyer: ZatcaPartyDetails
  items: BillingLineItemInput[]
  previousInvoiceHash?: string
}

export interface ZatcaGeneratedInvoice {
  invoiceUuid: string
  invoiceNumber: string
  category: ZatcaInvoiceCategory
  zatcaSubtypeCode: '0100000' | '0200000'
  zatcaWorkflow: 'CLEARANCE' | 'REPORTING'
  timestampIso: string
  seller: ZatcaPartyDetails & { vatNumber: string }
  buyer: ZatcaPartyDetails
  lineItems: ComputedBillingLineItem[]
  subtotalExclVatSar: string
  vatTotalSar: string
  totalWithVatSar: string
  previousInvoiceHash: string
  invoiceXmlHashBase64: string
  tlvQrBase64: string
  qrCodeSvg: string
  ublXml: string
}

export const ZATCA_GENESIS_PREVIOUS_HASH =
  'NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ=='

/**
 * Validates a 15-digit Saudi VAT Registration Number (begins and ends with '3').
 */
export function isValidSaudiVatNumber(vatNumber: string | undefined): boolean {
  if (!vatNumber) return false
  return /^3\d{13}3$/.test(vatNumber.trim())
}

/**
 * Encodes a single TLV (Tag-Length-Value) field according to ZATCA technical specifications.
 * Supports UTF-8 Arabic seller names up to 255 bytes per tag.
 */
function encodeSingleTlvField(tag: number, value: string | Uint8Array): Buffer {
  const valueBuffer =
    typeof value === 'string' ? Buffer.from(value, 'utf8') : Buffer.from(value)
  if (valueBuffer.length > 255) {
    throw new Error(`ZATCA TLV Tag ${tag} exceeds 255-byte single-octet length limit.`)
  }
  const header = Buffer.from([tag & 0xff, valueBuffer.length & 0xff])
  return Buffer.concat([header, valueBuffer])
}

/**
 * Generates a ZATCA-compliant Base64 TLV QR string encoding Tags 1..5
 * (and optional Phase-2 Tags 6..8 when cryptographic stamp fields are provided).
 */
export function encodeZatcaTlvQrCode(payload: ZatcaTlvPayload): string {
  const chunks: Buffer[] = [
    encodeSingleTlvField(1, payload.sellerName),
    encodeSingleTlvField(2, payload.vatNumber),
    encodeSingleTlvField(3, payload.timestampIso),
    encodeSingleTlvField(4, payload.totalWithVat),
    encodeSingleTlvField(5, payload.vatTotal),
  ]

  if (payload.invoiceHashBase64) {
    chunks.push(encodeSingleTlvField(6, payload.invoiceHashBase64))
  }
  if (payload.ecdsaSignatureBase64) {
    chunks.push(encodeSingleTlvField(7, payload.ecdsaSignatureBase64))
  }
  if (payload.publicKeyBase64) {
    chunks.push(encodeSingleTlvField(8, payload.publicKeyBase64))
  }

  return Buffer.concat(chunks).toString('base64')
}

/**
 * Decodes a Base64 ZATCA TLV QR string back into structured tag values for verification/auditing.
 */
export function decodeZatcaTlvQrCode(tlvBase64: string): Record<number, string> {
  const buf = Buffer.from(tlvBase64, 'base64')
  const decoded: Record<number, string> = {}
  let offset = 0

  while (offset + 2 <= buf.length) {
    const tag = buf[offset]
    const length = buf[offset + 1]
    offset += 2
    if (offset + length > buf.length) {
      break
    }
    decoded[tag] = buf.subarray(offset, offset + length).toString('utf8')
    offset += length
  }

  return decoded
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Generates a ZATCA Phase-2 Electronic Tax Invoice (B2B Standard or B2C Simplified)
 * with UBL 2.1 XML, SHA-256 Invoice Hash, Cryptographic Stamp Stub, TLV Base64 QR, and SVG QR.
 */
export function generateZatcaPhase2Invoice(
  input: GenerateZatcaInvoiceInput
): ZatcaGeneratedInvoice {
  if (!isValidSaudiVatNumber(input.seller.vatNumber)) {
    throw new Error(
      'رقم التسجيل الضريبي للمورد (Seller VAT Number) يجب أن يتكون من 15 رقماً ويبدأ وينتهي بالرقم 3.'
    )
  }

  if (
    input.category === 'B2B_TAX_INVOICE' &&
    !isValidSaudiVatNumber(input.buyer.vatNumber)
  ) {
    throw new Error(
      'الفاتورة الضريبية القياسية (B2B) تتطلب رقم تسجيل ضريبي صالحاً للمشتري (15 رقماً يبدأ وينتهي بـ 3).'
    )
  }

  if (input.items.length === 0) {
    throw new Error('يجب أن تتضمن الفاتورة بنداً واحداً على الأقل.')
  }

  const issueDate = input.issueTimestamp ?? new Date()
  const timestampIso = issueDate.toISOString().replace(/\.\d{3}Z$/, 'Z')
  const datePart = timestampIso.slice(0, 10)
  const timePart = timestampIso.slice(11, 19)
  const invoiceUuid = randomUUID()

  const zatcaSubtypeCode: '0100000' | '0200000' =
    input.category === 'B2B_TAX_INVOICE' ? '0100000' : '0200000'
  const zatcaWorkflow: 'CLEARANCE' | 'REPORTING' =
    input.category === 'B2B_TAX_INVOICE' ? 'CLEARANCE' : 'REPORTING'

  let subtotalNumeric = 0
  let vatTotalNumeric = 0

  const computedItems: ComputedBillingLineItem[] = input.items.map((item, idx) => {
    const vatRate = item.vatRate ?? 0.15
    const lineSubtotal = Number((item.quantity * item.unitPriceSar).toFixed(2))
    const lineVat = Number((lineSubtotal * vatRate).toFixed(2))
    const lineTotal = Number((lineSubtotal + lineVat).toFixed(2))

    subtotalNumeric += lineSubtotal
    vatTotalNumeric += lineVat

    return {
      lineNumber: idx + 1,
      description: item.description,
      quantity: item.quantity,
      unitPriceSar: Number(item.unitPriceSar.toFixed(2)),
      vatRate,
      lineSubtotalSar: lineSubtotal,
      lineVatSar: lineVat,
      lineTotalWithVatSar: lineTotal,
    }
  })

  const subtotalExclVatSar = subtotalNumeric.toFixed(2)
  const vatTotalSar = vatTotalNumeric.toFixed(2)
  const totalWithVatSar = (subtotalNumeric + vatTotalNumeric).toFixed(2)
  const previousInvoiceHash =
    input.previousInvoiceHash || ZATCA_GENESIS_PREVIOUS_HASH

  // Construct UBL 2.1 XML Envelope compliant with ZATCA Fatoora Phase-2 structure
  const ublXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${escapeXml(input.invoiceNumber)}</cbc:ID>
  <cbc:UUID>${invoiceUuid}</cbc:UUID>
  <cbc:IssueDate>${datePart}</cbc:IssueDate>
  <cbc:IssueTime>${timePart}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="${zatcaSubtypeCode}">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${previousInvoiceHash}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(input.seller.vatNumber)}</cbc:CompanyID>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(input.seller.legalName)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      ${
        input.buyer.vatNumber
          ? `<cac:PartyTaxScheme><cbc:CompanyID>${escapeXml(
              input.buyer.vatNumber
            )}</cbc:CompanyID></cac:PartyTaxScheme>`
          : ''
      }
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(input.buyer.legalName)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${vatTotalSar}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="SAR">${subtotalExclVatSar}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${totalWithVatSar}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="SAR">${totalWithVatSar}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`

  const invoiceXmlHashBase64 = createHash('sha256')
    .update(ublXml, 'utf8')
    .digest('base64')

  const signingSecret =
    process.env.ZATCA_CSID_PRIVATE_KEY || 'maqar-zatca-phase2-csid-stub-key'
  const ecdsaSignatureBase64 = createHmac('sha256', signingSecret)
    .update(invoiceXmlHashBase64)
    .digest('base64')
  const publicKeyBase64 = Buffer.from(
    process.env.ZATCA_CSID_PUBLIC_KEY || 'MAQAR-ZATCA-PHASE2-ECDSA-PUBKEY-STUB',
    'utf8'
  ).toString('base64')

  const tlvQrBase64 = encodeZatcaTlvQrCode({
    sellerName: input.seller.legalName,
    vatNumber: input.seller.vatNumber,
    timestampIso,
    totalWithVat: totalWithVatSar,
    vatTotal: vatTotalSar,
    invoiceHashBase64: invoiceXmlHashBase64,
    ecdsaSignatureBase64,
    publicKeyBase64,
  })

  const qrCodeSvg = renderSVG(tlvQrBase64)

  return {
    invoiceUuid,
    invoiceNumber: input.invoiceNumber,
    category: input.category,
    zatcaSubtypeCode,
    zatcaWorkflow,
    timestampIso,
    seller: input.seller,
    buyer: input.buyer,
    lineItems: computedItems,
    subtotalExclVatSar,
    vatTotalSar,
    totalWithVatSar,
    previousInvoiceHash,
    invoiceXmlHashBase64,
    tlvQrBase64,
    qrCodeSvg,
    ublXml,
  }
}

