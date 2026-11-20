import { describe, expect, it } from 'vitest'
import {
  classifyAppealDeadlineWindow,
  classifyHearingAlertWindow,
  composeArabicProceduralAlert,
  dispatchMultiChannelProceduralAlert,
} from '../src/services/procedural-notifications'
import {
  dispatchContractForSignature,
  prepareContractDocumentHash,
  recordSignerExecution,
} from '../src/services/esignature'
import {
  decodeZatcaTlvQrCode,
  generateZatcaPhase2Invoice,
} from '../src/services/billing'

describe('Maqar External Services Layer', () => {
  describe('1. Automated Procedural Notifications Worker', () => {
    const baseNow = new Date('2026-11-01T08:00:00Z')

    it('detects hearings scheduled in 7 days, 3 days, and 24 hours', () => {
      const in7d = new Date(baseNow.getTime() + 7 * 24 * 60 * 60 * 1000)
      const in3d = new Date(baseNow.getTime() + 3 * 24 * 60 * 60 * 1000)
      const in24h = new Date(baseNow.getTime() + 24 * 60 * 60 * 1000)
      const in15d = new Date(baseNow.getTime() + 15 * 24 * 60 * 60 * 1000)

      expect(classifyHearingAlertWindow(in7d, baseNow)).toBe('HEARING_T_7D')
      expect(classifyHearingAlertWindow(in3d, baseNow)).toBe('HEARING_T_3D')
      expect(classifyHearingAlertWindow(in24h, baseNow)).toBe('HEARING_T_24H')
      expect(classifyHearingAlertWindow(in15d, baseNow)).toBeNull()
    })

    it('detects appeal deadlines expiring in 10 days and 3 days and composes Arabic phrasing', async () => {
      const in10d = new Date(baseNow.getTime() + 10 * 24 * 60 * 60 * 1000)
      const in3d = new Date(baseNow.getTime() + 3 * 24 * 60 * 60 * 1000)

      expect(classifyAppealDeadlineWindow(in10d, baseNow)).toBe('APPEAL_D_10D')
      expect(classifyAppealDeadlineWindow(in3d, baseNow)).toBe('APPEAL_D_3D')

      const copy = composeArabicProceduralAlert({
        trigger: 'APPEAL_D_3D',
        caseNumber: '4470883419',
        courtType: 'المحكمة العمالية بالرياض',
        plaintiff: 'ماجد الشمري',
        defendant: 'شركة النخبة',
        targetDate: in3d,
      })

      expect(copy.body).toContain('4470883419')
      expect(copy.body).toContain('مهلة الاعتراض الاستئنافي')

      const dispatches = await dispatchMultiChannelProceduralAlert({
        recipientEmail: 'khaled@khaledlaw.sa',
        recipientPhone: '+966500000000',
        subject: copy.subject,
        body: copy.body,
        metadata: { caseId: 'case-1', sessionId: 'sess-1', trigger: 'APPEAL_D_3D' },
      })

      expect(dispatches.map((d) => d.channel)).toEqual(['WHATSAPP', 'SMS', 'EMAIL'])
    })
  })

  describe('2. E-Signature Service Wrapper (services/esignature.ts)', () => {
    it('hashes contract body, orders signers (Client -> Company Rep -> Witness), and emits cryptographic audit trail', async () => {
      const content = 'اتفاقية عدم إفصاح وحماية بيانات سرية بين الطرفين.'
      const expectedHash = prepareContractDocumentHash(content)
      expect(expectedHash).toHaveLength(64)

      // Intentionally pass signers out of order to verify deterministic routing order
      const envelope = await dispatchContractForSignature({
        contractId: 'clm-nda-01',
        workspaceId: 'ws-corp-01',
        contractTitle: 'اتفاقية عدم إفصاح (NDA)',
        documentContent: content,
        initiatorIpAddress: '185.19.44.10',
        initiatorUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X) Safari/605.1',
        requireNafathAssurance: true,
        signers: [
          {
            role: 'WITNESS',
            fullName: 'فهد الشهري',
            email: 'witness@nationaltech.sa',
          },
          {
            role: 'CLIENT',
            fullName: 'عبدالله العميل',
            email: 'client@counterparty.sa',
          },
          {
            role: 'COMPANY_REPRESENTATIVE',
            fullName: 'سلطان العريفي',
            email: 'legal.director@nationaltech.sa',
          },
        ],
      })

      expect(envelope.documentHashSha256).toBe(expectedHash)
      expect(envelope.orderedSigners.map((s) => s.role)).toEqual([
        'CLIENT',
        'COMPANY_REPRESENTATIVE',
        'WITNESS',
      ])
      expect(envelope.orderedSigners[0].status).toBe('NOTIFIED')
      expect(envelope.auditTrail).toHaveLength(1)
      expect(envelope.auditTrail[0].ipAddress).toBe('185.19.44.10')
      expect(envelope.auditTrail[0].deviceFingerprint).toMatch(/^dfp_/)
      expect(envelope.auditTrail[0].signatureCertificate.assuranceLevel).toBe(
        'NAFATH_VERIFIED_PKI'
      )

      // Execute Client signature and verify Company Representative becomes NOTIFIED
      const afterClientSigned = recordSignerExecution({
        envelope,
        signerRole: 'CLIENT',
        signerEmail: 'client@counterparty.sa',
        ipAddress: '95.184.22.11',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)',
      })

      expect(afterClientSigned.status).toBe('PARTIALLY_SIGNED')
      expect(afterClientSigned.orderedSigners[0].status).toBe('SIGNED')
      expect(afterClientSigned.orderedSigners[1].status).toBe('NOTIFIED')
      expect(afterClientSigned.auditTrail).toHaveLength(2)
    })
  })

  describe('3. ZATCA Phase-2 Electronic Invoicing Stub (services/billing.ts)', () => {
    it('generates B2B Standard Tax Invoice and B2C Simplified Invoice with valid TLV QR tags 1..5', () => {
      const issueTimestamp = new Date('2026-10-30T17:00:00Z')

      const b2bInvoice = generateZatcaPhase2Invoice({
        invoiceNumber: 'INV-MQR-2026-0001',
        category: 'B2B_TAX_INVOICE',
        issueTimestamp,
        seller: {
          legalName: 'شركة خالد وشركاؤه للمحاماة والاستشارات القانونية',
          vatNumber: '310122393500003',
          city: 'الدمام',
        },
        buyer: {
          legalName: 'الشركة الوطنية للتقنية',
          vatNumber: '300055912400003',
          city: 'الرياض',
        },
        items: [
          {
            description: 'أتعاب الترافع والتمثيل القضائي أمام المحكمة التجارية',
            quantity: 1,
            unitPriceSar: 50000,
          },
        ],
      })

      expect(b2bInvoice.zatcaSubtypeCode).toBe('0100000')
      expect(b2bInvoice.zatcaWorkflow).toBe('CLEARANCE')
      expect(b2bInvoice.subtotalExclVatSar).toBe('50000.00')
      expect(b2bInvoice.vatTotalSar).toBe('7500.00')
      expect(b2bInvoice.totalWithVatSar).toBe('57500.00')
      expect(b2bInvoice.qrCodeSvg).toContain('<svg')

      // Decode TLV Base64 QR and verify Tags 1..5
      const decodedTags = decodeZatcaTlvQrCode(b2bInvoice.tlvQrBase64)
      expect(decodedTags[1]).toBe(
        'شركة خالد وشركاؤه للمحاماة والاستشارات القانونية'
      )
      expect(decodedTags[2]).toBe('310122393500003')
      expect(decodedTags[3]).toBe('2026-10-30T17:00:00Z')
      expect(decodedTags[4]).toBe('57500.00')
      expect(decodedTags[5]).toBe('7500.00')

      // B2C Simplified Invoice (no buyer VAT required)
      const b2cInvoice = generateZatcaPhase2Invoice({
        invoiceNumber: 'INV-MQR-2026-0002',
        category: 'B2C_SIMPLIFIED_INVOICE',
        issueTimestamp,
        seller: {
          legalName: 'شركة خالد وشركاؤه للمحاماة والاستشارات القانونية',
          vatNumber: '310122393500003',
        },
        buyer: {
          legalName: 'ماجد بن عبدالله الشمري',
        },
        items: [
          {
            description: 'استشارة قانونية وصياغة لائحة اعتراضية',
            quantity: 1,
            unitPriceSar: 2000,
          },
        ],
      })

      expect(b2cInvoice.zatcaSubtypeCode).toBe('0200000')
      expect(b2cInvoice.zatcaWorkflow).toBe('REPORTING')
      expect(b2cInvoice.totalWithVatSar).toBe('2300.00')
    })
  })
})
