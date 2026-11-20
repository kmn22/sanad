import { describe, it, expect } from 'vitest'
import {
  calculateProceduralDeadline,
  evaluateHearingAlertWindow,
  dispatchHearingMultiChannelAlerts,
  generateBriefDocxBuffer,
  generateCourtReadyPdfHtml,
  DEFAULT_SAMPLE_BRIEF,
} from '../src/lib/litigation'

describe('Maqar Litigation Deadline & Alert Engine', () => {
  it('auto-calculates 30-day statutory appeal deadline for FIRST_INSTANCE_JUDGMENT and schedules T-7d, T-3d, T-24h alerts', () => {
    const triggerDate = new Date('2026-10-01T09:00:00Z')
    const now = new Date('2026-10-25T09:00:00Z') // 6 days remaining -> inside T-7D window

    const deadline = calculateProceduralDeadline(
      'FIRST_INSTANCE_JUDGMENT',
      triggerDate,
      now
    )

    expect(deadline.periodDays).toBe(30)
    expect(deadline.dueDateIso).toBe('2026-10-31T09:00:00.000Z')
    expect(deadline.remainingDays).toBe(6)
    expect(deadline.activeAlertWindow).toBe('T_MINUS_7D')
    expect(deadline.scheduledAlertTimestamps.T_MINUS_7D).toBe(
      '2026-10-24T09:00:00.000Z'
    )
    expect(deadline.scheduledAlertTimestamps.T_MINUS_3D).toBe(
      '2026-10-28T09:00:00.000Z'
    )
    expect(deadline.scheduledAlertTimestamps.T_MINUS_24H).toBe(
      '2026-10-30T09:00:00.000Z'
    )
  })

  it('calculates 15-day objection window for EXPERT_PRELIMINARY_REPORT and 10-day window for URGENT_SUMMARY_JUDGMENT', () => {
    const base = new Date('2026-11-01T00:00:00Z')
    const expert = calculateProceduralDeadline(
      'EXPERT_PRELIMINARY_REPORT',
      base,
      base
    )
    expect(expert.periodDays).toBe(15)

    const urgent = calculateProceduralDeadline(
      'URGENT_SUMMARY_JUDGMENT',
      base,
      base
    )
    expect(urgent.periodDays).toBe(10)
  })

  it('detects T-7d, T-3d, and T-24h hearing alert windows accurately', () => {
    const refNow = new Date('2026-11-01T10:00:00Z')

    const in7Days = new Date(refNow.getTime() + 7 * 24 * 3600_000)
    expect(evaluateHearingAlertWindow(in7Days, refNow)).toMatchObject({
      shouldTrigger: true,
      windowKey: 'T_MINUS_7D',
    })

    const in3Days = new Date(refNow.getTime() + 3 * 24 * 3600_000)
    expect(evaluateHearingAlertWindow(in3Days, refNow)).toMatchObject({
      shouldTrigger: true,
      windowKey: 'T_MINUS_3D',
    })

    const in18Hours = new Date(refNow.getTime() + 18 * 3600_000)
    expect(evaluateHearingAlertWindow(in18Hours, refNow)).toMatchObject({
      shouldTrigger: true,
      windowKey: 'T_MINUS_24H',
    })
  })

  it('dispatches multi-channel hearing alerts (IN_APP, EMAIL, WHATSAPP_WEBHOOK, SMS_WEBHOOK)', async () => {
    const receipt = await dispatchHearingMultiChannelAlerts({
      caseId: 'case-101',
      caseNumber: '447091882',
      courtType: 'المحكمة التجارية بالرياض',
      hearingDateIso: '2026-11-14T09:00:00Z',
      windowKey: 'T_MINUS_3D',
      channels: ['IN_APP', 'EMAIL', 'WHATSAPP_WEBHOOK', 'SMS_WEBHOOK'],
      recipients: [
        {
          name: 'المحامي د. فيصل',
          email: 'faisal@maqar.sa',
          phone: '+966500000000',
        },
      ],
    })

    expect(receipt.windowKey).toBe('T_MINUS_3D')
    expect(receipt.deliveries).toHaveLength(4)
  })
})

describe('Maqar Brief & Memo Builder Export Pipeline (DOCX & PDF)', () => {
  it('generates a valid court-ready DOCX binary buffer with PK zip signature', async () => {
    const bytes = await generateBriefDocxBuffer(DEFAULT_SAMPLE_BRIEF)
    expect(bytes.byteLength).toBeGreaterThan(2000)
    // DOCX files are OpenXML ZIP archives starting with 'PK' (0x50, 0x4b)
    expect(bytes[0]).toBe(0x50)
    expect(bytes[1]).toBe(0x4b)
  })

  it('generates court-ready printable PDF HTML containing all 4 formal pleading sections', () => {
    const html = generateCourtReadyPdfHtml(DEFAULT_SAMPLE_BRIEF)
    expect(html).toContain('أولاً: صفة الخصوم والوقائع الإجرائية')
    expect(html).toContain('ثانياً: الدفوع الشكلية والموضوعية')
    expect(html).toContain('ثالثاً: الأسانيد النظامية والشرعية والسوابق القضائية')
    expect(html).toContain('رابعاً: الطلبات الختامية')
    expect(html).toContain(DEFAULT_SAMPLE_BRIEF.caseNumber)
  })
})

