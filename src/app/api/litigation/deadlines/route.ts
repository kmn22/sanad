import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import {
  calculateProceduralDeadline,
  dispatchHearingMultiChannelAlerts,
  evaluateHearingAlertWindow,
  type ProceduralTriggerEvent,
} from '@/lib/litigation/deadline-engine'

function isSafeOutboundWebhookUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol !== 'https:') return false
    const host = parsed.hostname.toLowerCase()
    if (
      host === 'localhost' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host === '[::1]' ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return false
    }
    return true
  } catch {
    return false
  }
}

const EVENTS: [ProceduralTriggerEvent, ...ProceduralTriggerEvent[]] = [
  'FIRST_INSTANCE_JUDGMENT',
  'URGENT_SUMMARY_JUDGMENT',
  'SUPREME_COURT_CASSATION',
  'EXPERT_PRELIMINARY_REPORT',
  'EXCHANGE_OF_BRIEFS_ORDER',
  'ADMINISTRATIVE_GRIEVANCE',
  'ENFORCEMENT_ORDER_NOTICE',
]

const calculateSchema = z.object({
  action: z.enum(['CALCULATE_DEADLINE', 'DISPATCH_HEARING_ALERTS']).default('CALCULATE_DEADLINE'),
  event: z.enum(EVENTS).optional(),
  triggerDate: z.string().optional(),
  // Fields for DISPATCH_HEARING_ALERTS
  caseId: z.string().optional(),
  caseNumber: z.string().optional(),
  courtType: z.string().optional(),
  hearingDateIso: z.string().optional(),
  windowKey: z.enum(['T_MINUS_7D', 'T_MINUS_3D', 'T_MINUS_24H']).optional(),
  channels: z
    .array(z.enum(['EMAIL', 'IN_APP', 'SMS_WEBHOOK', 'WHATSAPP_WEBHOOK']))
    .optional(),
  recipients: z
    .array(
      z.object({
        userId: z.string().optional(),
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
      })
    )
    .optional(),
  webhookUrl: z.string().url().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const parsed = calculateSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid litigation deadline payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    if (data.action === 'DISPATCH_HEARING_ALERTS') {
      const auth = await getAuthContext()
      if (!auth) return unauthorizedJson()
      if (data.webhookUrl && !isSafeOutboundWebhookUrl(data.webhookUrl)) {
        return NextResponse.json(
          { error: 'Outbound webhook URL must use HTTPS and target a public endpoint' },
          { status: 400 }
        )
      }

      const hearingDate = data.hearingDateIso || new Date(Date.now() + 24 * 3600_000).toISOString()
      const evalWindow = evaluateHearingAlertWindow(hearingDate)
      const windowKey = data.windowKey || evalWindow.windowKey || 'T_MINUS_24H'

      const receipt = await dispatchHearingMultiChannelAlerts({
        caseId: data.caseId || 'case-default',
        caseNumber: data.caseNumber || '447091882',
        courtType: data.courtType || 'المحكمة التجارية بالرياض',
        hearingDateIso: hearingDate,
        windowKey,
        channels: data.channels || ['IN_APP', 'EMAIL', 'WHATSAPP_WEBHOOK', 'SMS_WEBHOOK'],
        recipients: data.recipients || [
          { name: 'المحامي المسؤول', email: 'counsel@maqar.sa', phone: '+966500000000' },
        ],
        webhookUrl: data.webhookUrl,
      })

      return NextResponse.json({ evaluation: evalWindow, receipt }, { status: 200 })
    }

    const event = data.event || 'FIRST_INSTANCE_JUDGMENT'
    const triggerDate = data.triggerDate || new Date().toISOString()
    const calculated = calculateProceduralDeadline(event, triggerDate)

    return NextResponse.json(calculated, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deadline calculation failed' },
      { status: 500 }
    )
  }
}

