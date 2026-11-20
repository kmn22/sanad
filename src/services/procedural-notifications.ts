/**
 * ============================================================================
 * Maqar (مقر) External Services — Automated Procedural Notifications Worker
 * (`src/services/procedural-notifications.ts`)
 * ============================================================================
 *
 * Scheduled daily worker querying `CaseSession` records to:
 *   1. Detect court hearings scheduled in 7 days (T-7d), 3 days (T-3d), and 24 hours (T-24h).
 *   2. Detect statutory appeal / procedural deadlines expiring in 10 days (D-10d) and 3 days (D-3d).
 *   3. Format court-grade Arabic legal alerts and dispatch across:
 *      - WhatsApp Business Cloud API Webhook
 *      - SMS Gateway Provider (Unifonic / Twilio KSA)
 *      - Transactional Email Service
 */

import { db } from '@/lib/db'

export type HearingAlertWindow = 'HEARING_T_7D' | 'HEARING_T_3D' | 'HEARING_T_24H'
export type AppealAlertWindow = 'APPEAL_D_10D' | 'APPEAL_D_3D'
export type ProceduralAlertTrigger = HearingAlertWindow | AppealAlertWindow

export type NotificationChannel = 'WHATSAPP' | 'SMS' | 'EMAIL'

export interface ProceduralAlertPayload {
  alertId: string
  trigger: ProceduralAlertTrigger
  sessionId: string
  caseId: string
  caseNumber: string
  courtType: string
  plaintiff: string
  defendant: string
  targetDateIso: string
  remainingDays: number
  arabicSubject: string
  arabicBody: string
  channelsDispatched: Array<{
    channel: NotificationChannel
    status: 'SENT' | 'DRY_RUN_LOGGED' | 'FAILED'
    providerMessageId?: string
    error?: string
  }>
}

export interface ProceduralWorkerReport {
  executedAtIso: string
  scannedSessionsCount: number
  hearingAlertsCount: number
  appealDeadlineAlertsCount: number
  totalDispatchedAlerts: number
  alerts: ProceduralAlertPayload[]
}

const MS_PER_HOUR = 60 * 60 * 1000
const MS_PER_DAY = 24 * MS_PER_HOUR

/**
 * Classifies whether a hearing timestamp falls into the T-7d, T-3d, or T-24h alert window
 * relative to `referenceNow` (using a +/- 12h daily cron tolerance window).
 */
export function classifyHearingAlertWindow(
  sessionDate: Date,
  referenceNow: Date = new Date()
): HearingAlertWindow | null {
  const diffHours = (sessionDate.getTime() - referenceNow.getTime()) / MS_PER_HOUR
  if (diffHours <= 0) return null

  if (diffHours >= 12 && diffHours <= 36) {
    return 'HEARING_T_24H'
  }
  if (diffHours >= 60 && diffHours <= 84) {
    return 'HEARING_T_3D'
  }
  if (diffHours >= 156 && diffHours <= 180) {
    return 'HEARING_T_7D'
  }
  return null
}

/**
 * Classifies whether a statutory appeal/procedural deadline falls into the
 * 10-day (`APPEAL_D_10D`) or 3-day (`APPEAL_D_3D`) expiration window.
 */
export function classifyAppealDeadlineWindow(
  proceduralDeadline: Date,
  referenceNow: Date = new Date()
): AppealAlertWindow | null {
  const diffHours =
    (proceduralDeadline.getTime() - referenceNow.getTime()) / MS_PER_HOUR
  if (diffHours <= 0) return null

  if (diffHours >= 60 && diffHours <= 84) {
    return 'APPEAL_D_3D'
  }
  if (diffHours >= 228 && diffHours <= 252) {
    return 'APPEAL_D_10D'
  }
  return null
}

/**
 * Builds professional Saudi legal Arabic notification copy for WhatsApp, SMS, and Email.
 */
export function composeArabicProceduralAlert(params: {
  trigger: ProceduralAlertTrigger
  caseNumber: string
  courtType: string
  plaintiff: string
  defendant: string
  targetDate: Date
  summary?: string | null
}): { subject: string; body: string; remainingDays: number } {
  const formattedDate = params.targetDate.toISOString().slice(0, 10)

  switch (params.trigger) {
    case 'HEARING_T_7D':
      return {
        remainingDays: 7,
        subject: `[مقر — تنبيه جلسة قضائية خلال 7 أيام] القضية رقم (${params.caseNumber})`,
        body: `إشعار مواعيد قضائية من منصة «مقر»:\nنفيدكم بأن موعد الجلسة القادمة في القضية رقم (${params.caseNumber}) المقامة من (${params.plaintiff}) ضد (${params.defendant}) أمام (${params.courtType}) محدد بتاريخ ${formattedDate} (خلال 7 أيام). يرجى استكمال المذكرات الجوابية والمرفقات عبر بوابة ناجز قبل الموعد بوقت كافٍ.`,
      }
    case 'HEARING_T_3D':
      return {
        remainingDays: 3,
        subject: `[مقر — تذكير هام: جلسة خلال 3 أيام] القضية رقم (${params.caseNumber})`,
        body: `تذكير إجرائي هام من منصة «مقر»:\nيتبقى (3 أيام) على انعقاد جلسة المرافعة في القضية رقم (${params.caseNumber}) أمام (${params.courtType}) بتاريخ ${formattedDate}. يرجى التحقق من جاهزية الوكالة الشرعية السارية وإيداع المذكرة الختامية.`,
      }
    case 'HEARING_T_24H':
      return {
        remainingDays: 1,
        subject: `[عاجل — جلسة قضائية غداً خلال 24 ساعة] القضية رقم (${params.caseNumber})`,
        body: `تنبيه عاجل من منصة «مقر»:\nتنعقد خلال (24 ساعة) الجلسة القضائية المقررة في القضية رقم (${params.caseNumber}) أمام (${params.courtType}) بتاريخ ${formattedDate} (${params.plaintiff} ضد ${params.defendant}). يرجى الدخول المبكر إلى قاعة الجلسة المرئية والتحقق من ضبط الحضور.`,
      }
    case 'APPEAL_D_10D':
      return {
        remainingDays: 10,
        subject: `[مقر — تنبيه سريان مهلة الاستئناف: متبقٍ 10 أيام] القضية رقم (${params.caseNumber})`,
        body: `تنبيه مدد نظامية قاطعة من منصة «مقر»:\nيتبقى (10 أيام) على انتهاء المهلة النظامية لتقديم لائحة الاعتراض الاستئنافي في القضية رقم (${params.caseNumber}) أمام (${params.courtType})، والتي تنتهي بتاريخ ${formattedDate} وفق المادة (187) من نظام المرافعات الشرعية. يرجى استكمال مراجعة أسباب الاعتراض والطلبات الختامية.`,
      }
    case 'APPEAL_D_3D':
      return {
        remainingDays: 3,
        subject: `[إنذار أخير — سقوط مهلة الاستئناف خلال 3 أيام] القضية رقم (${params.caseNumber})`,
        body: `إنذار نهائي بالمدد النظامية من منصة «مقر»:\nيتبقى (3 أيام فقط) على انقضاء مهلة الاعتراض الاستئنافي واكتساب الحكم القطعية في القضية رقم (${params.caseNumber}) أمام (${params.courtType}) (تاريخ الانتهاء: ${formattedDate}). يجب قيد اللائحة الاعتراضية فوراً تلافياً لسقوط الحق في الاستئناف شكلاً.`,
      }
  }
}

/**
 * Dispatches an Arabic procedural alert across WhatsApp Business API, SMS Gateway, and Transactional Email.
 * Gracefully operates in deterministic `DRY_RUN_LOGGED` mode when external provider credentials are omitted.
 */
export async function dispatchMultiChannelProceduralAlert(params: {
  recipientPhone?: string
  recipientEmail?: string
  subject: string
  body: string
  metadata: Record<string, string>
}): Promise<ProceduralAlertPayload['channelsDispatched']> {
  const results: ProceduralAlertPayload['channelsDispatched'] = []

  // 1. WhatsApp Business Cloud API Webhook
  const whatsappUrl = process.env.WHATSAPP_BUSINESS_API_URL
  const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN
  if (whatsappUrl && whatsappToken && params.recipientPhone) {
    try {
      const res = await fetch(whatsappUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${whatsappToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: params.recipientPhone,
          type: 'text',
          text: { body: params.body },
        }),
      })
      results.push({
        channel: 'WHATSAPP',
        status: res.ok ? 'SENT' : 'FAILED',
        providerMessageId: `wa-${Date.now()}`,
      })
    } catch (err) {
      results.push({
        channel: 'WHATSAPP',
        status: 'FAILED',
        error: err instanceof Error ? err.message : String(err),
      })
    }
  } else {
    results.push({
      channel: 'WHATSAPP',
      status: 'DRY_RUN_LOGGED',
      providerMessageId: `wa-dryrun-${Date.now()}`,
    })
  }

  // 2. SMS Provider (Unifonic / Twilio KSA)
  const smsApiUrl = process.env.SMS_PROVIDER_API_URL
  const smsApiKey = process.env.SMS_PROVIDER_API_KEY
  if (smsApiUrl && smsApiKey && params.recipientPhone) {
    try {
      const res = await fetch(smsApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${smsApiKey}`,
        },
        body: JSON.stringify({
          recipient: params.recipientPhone,
          senderId: process.env.SMS_SENDER_ID || 'MAQAR',
          body: params.body,
        }),
      })
      results.push({
        channel: 'SMS',
        status: res.ok ? 'SENT' : 'FAILED',
        providerMessageId: `sms-${Date.now()}`,
      })
    } catch (err) {
      results.push({
        channel: 'SMS',
        status: 'FAILED',
        error: err instanceof Error ? err.message : String(err),
      })
    }
  } else {
    results.push({
      channel: 'SMS',
      status: 'DRY_RUN_LOGGED',
      providerMessageId: `sms-dryrun-${Date.now()}`,
    })
  }

  // 3. Transactional Email Webhook / SMTP Relay
  const emailWebhookUrl = process.env.TRANSACTIONAL_EMAIL_WEBHOOK_URL
  if (emailWebhookUrl && params.recipientEmail) {
    try {
      const res = await fetch(emailWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TRANSACTIONAL_EMAIL_API_KEY || ''}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Maqar Legal Ops <alerts@maqar.sa>',
          to: params.recipientEmail,
          subject: params.subject,
          text: params.body,
          metadata: params.metadata,
        }),
      })
      results.push({
        channel: 'EMAIL',
        status: res.ok ? 'SENT' : 'FAILED',
        providerMessageId: `mail-${Date.now()}`,
      })
    } catch (err) {
      results.push({
        channel: 'EMAIL',
        status: 'FAILED',
        error: err instanceof Error ? err.message : String(err),
      })
    }
  } else {
    results.push({
      channel: 'EMAIL',
      status: 'DRY_RUN_LOGGED',
      providerMessageId: `mail-dryrun-${Date.now()}`,
    })
  }

  return results
}

/**
 * Scheduled Daily Cron Worker (`runDailyProceduralNotificationsWorker`):
 * Queries `CaseSession` records within the upcoming 12-day horizon, evaluates
 * T-7d / T-3d / T-24h hearing windows and D-10d / D-3d appeal deadline windows,
 * and dispatches multi-channel Arabic notifications.
 *
 * When `tenantScope` is provided (interactive tenant admin invocation without
 * global `CRON_SECRET`), strictly filters `CaseSession` rows by `orgId` and
 * `workspaceId` so cross-tenant litigation dockets can never be exposed.
 */
export async function runDailyProceduralNotificationsWorker(
  referenceNow: Date = new Date(),
  tenantScope?: { orgId: string; workspaceId?: string }
): Promise<ProceduralWorkerReport> {
  const horizonEnd = new Date(referenceNow.getTime() + 12 * MS_PER_DAY)

  const upcomingSessions = await db.caseSession.findMany({
    where: {
      ...(tenantScope
        ? {
            orgId: tenantScope.orgId,
            ...(tenantScope.workspaceId
              ? { litigationCase: { workspaceId: tenantScope.workspaceId } }
              : {}),
          }
        : {}),
      OR: [
        { sessionDate: { gte: referenceNow, lte: horizonEnd } },
        { proceduralDeadline: { gte: referenceNow, lte: horizonEnd } },
      ],
    },
    include: {
      litigationCase: {
        include: {
          workspace: {
            select: {
              settings: true,
              users: {
                take: 3,
                select: { email: true, name: true },
              },
            },
          },
        },
      },
    },
  })

  const alerts: ProceduralAlertPayload[] = []
  let hearingAlertsCount = 0
  let appealDeadlineAlertsCount = 0

  for (const session of upcomingSessions) {
    const litCase = session.litigationCase
    const primaryRecipient = litCase.workspace.users[0]
    const wsSettings =
      (litCase.workspace.settings as { alertPhone?: string } | null) || null
    const recipientPhone = wsSettings?.alertPhone

    // 1. Check Hearing Schedule Window (7d, 3d, 24h)
    const hearingTrigger = classifyHearingAlertWindow(
      session.sessionDate,
      referenceNow
    )
    if (hearingTrigger) {
      const copy = composeArabicProceduralAlert({
        trigger: hearingTrigger,
        caseNumber: litCase.caseNumber,
        courtType: litCase.courtType,
        plaintiff: litCase.plaintiff,
        defendant: litCase.defendant,
        targetDate: session.sessionDate,
        summary: session.summary,
      })

      const channelsDispatched = await dispatchMultiChannelProceduralAlert({
        recipientEmail: primaryRecipient?.email ?? undefined,
        recipientPhone,
        subject: copy.subject,
        body: copy.body,
        metadata: {
          caseId: litCase.id,
          sessionId: session.id,
          trigger: hearingTrigger,
        },
      })

      hearingAlertsCount++
      alerts.push({
        alertId: `alert-${session.id}-${hearingTrigger}`,
        trigger: hearingTrigger,
        sessionId: session.id,
        caseId: litCase.id,
        caseNumber: litCase.caseNumber,
        courtType: litCase.courtType,
        plaintiff: litCase.plaintiff,
        defendant: litCase.defendant,
        targetDateIso: session.sessionDate.toISOString(),
        remainingDays: copy.remainingDays,
        arabicSubject: copy.subject,
        arabicBody: copy.body,
        channelsDispatched,
      })
    }

    // 2. Check Appeal / Procedural Deadline Window (10d, 3d)
    if (session.proceduralDeadline) {
      const appealTrigger = classifyAppealDeadlineWindow(
        session.proceduralDeadline,
        referenceNow
      )
      if (appealTrigger) {
        const copy = composeArabicProceduralAlert({
          trigger: appealTrigger,
          caseNumber: litCase.caseNumber,
          courtType: litCase.courtType,
          plaintiff: litCase.plaintiff,
          defendant: litCase.defendant,
          targetDate: session.proceduralDeadline,
          summary: session.courtDecision,
        })

        const channelsDispatched = await dispatchMultiChannelProceduralAlert({
          recipientEmail: primaryRecipient?.email ?? undefined,
          recipientPhone,
          subject: copy.subject,
          body: copy.body,
          metadata: {
            caseId: litCase.id,
            sessionId: session.id,
            trigger: appealTrigger,
          },
        })

        appealDeadlineAlertsCount++
        alerts.push({
          alertId: `alert-${session.id}-${appealTrigger}`,
          trigger: appealTrigger,
          sessionId: session.id,
          caseId: litCase.id,
          caseNumber: litCase.caseNumber,
          courtType: litCase.courtType,
          plaintiff: litCase.plaintiff,
          defendant: litCase.defendant,
          targetDateIso: session.proceduralDeadline.toISOString(),
          remainingDays: copy.remainingDays,
          arabicSubject: copy.subject,
          arabicBody: copy.body,
          channelsDispatched,
        })
      }
    }
  }

  return {
    executedAtIso: referenceNow.toISOString(),
    scannedSessionsCount: upcomingSessions.length,
    hearingAlertsCount,
    appealDeadlineAlertsCount,
    totalDispatchedAlerts: alerts.length,
    alerts,
  }
}
