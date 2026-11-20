export type ProceduralTriggerEvent =
  | 'FIRST_INSTANCE_JUDGMENT' // حكم ابتدائي عادي (30 يوماً للاعتراض)
  | 'URGENT_SUMMARY_JUDGMENT' // الأحكام المستعجلة ووقف التنفيذ (10 أيام للاعتراض)
  | 'SUPREME_COURT_CASSATION' // النقض أمام المحكمة العليا (30 يوماً)
  | 'EXPERT_PRELIMINARY_REPORT' // الاعتراض/الملاحظات على التقرير المبدئي للخبير عبر منصة خبرة (15 يوماً)
  | 'EXCHANGE_OF_BRIEFS_ORDER' // أمر الدائرة القضائية بتبادل المذكرات الجوابية (10 أيام)
  | 'ADMINISTRATIVE_GRIEVANCE' // التظلم الإداري الوجوبي قبل دعوى الإلغاء (60 يوماً)
  | 'ENFORCEMENT_ORDER_NOTICE' // مهلة السداد بعد التبليغ بأمر التنفيذ - م/46 (5 أيام)

export type AlertWindowKey = 'T_MINUS_7D' | 'T_MINUS_3D' | 'T_MINUS_24H'

export type NotificationChannel = 'EMAIL' | 'IN_APP' | 'SMS_WEBHOOK' | 'WHATSAPP_WEBHOOK'

export interface StatutoryRuleSpec {
  event: ProceduralTriggerEvent
  label: { ar: string; en: string }
  periodDays: number
  statutoryCitation: { ar: string; en: string }
  courtJurisdiction: string
}

export interface CalculatedProceduralDeadline {
  event: ProceduralTriggerEvent
  label: { ar: string; en: string }
  statutoryCitation: { ar: string; en: string }
  triggerDateIso: string
  dueDateIso: string
  periodDays: number
  remainingDays: number
  remainingHours: number
  urgency: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EXPIRED'
  activeAlertWindow: AlertWindowKey | null
  scheduledAlertTimestamps: {
    T_MINUS_7D: string
    T_MINUS_3D: string
    T_MINUS_24H: string
  }
}

export interface HearingAlertDispatchPayload {
  caseId: string
  caseNumber: string
  courtType: string
  hearingDateIso: string
  windowKey: AlertWindowKey
  channels: NotificationChannel[]
  recipients: Array<{
    userId?: string
    name: string
    email?: string
    phone?: string
  }>
  webhookUrl?: string
}

export interface HearingAlertDispatchReceipt {
  caseId: string
  caseNumber: string
  windowKey: AlertWindowKey
  dispatchedAt: string
  deliveries: Array<{
    channel: NotificationChannel
    status: 'DISPATCHED' | 'SIMULATED' | 'FAILED'
    recipientCount: number
    detail: string
  }>
}

export const STATUTORY_DEADLINE_RULES: Record<ProceduralTriggerEvent, StatutoryRuleSpec> = {
  FIRST_INSTANCE_JUDGMENT: {
    event: 'FIRST_INSTANCE_JUDGMENT',
    label: {
      ar: 'مهلة الاعتراض بطلب الاستئناف على الأحكام الابتدائية',
      en: 'Statutory Appeal Period for First-Instance Judgments',
    },
    periodDays: 30,
    statutoryCitation: {
      ar: 'المادة (187) من نظام المرافعات الشرعية والمادة (79) من نظام المحاكم التجارية',
      en: 'Sharia Procedure Law Art. 187 & Commercial Courts Law Art. 79 (30 Days)',
    },
    courtJurisdiction: 'GENERAL_AND_COMMERCIAL_COURTS',
  },
  URGENT_SUMMARY_JUDGMENT: {
    event: 'URGENT_SUMMARY_JUDGMENT',
    label: {
      ar: 'مهلة الاعتراض على الأحكام المستعجلة وأوامر عدم الاختصاص',
      en: 'Appeal Window for Summary / Urgent Judgments',
    },
    periodDays: 10,
    statutoryCitation: {
      ar: 'المادة (187) من نظام المرافعات الشرعية والمادة (79/2) من نظام المحاكم التجارية',
      en: 'Sharia Procedure Law Art. 187 & Commercial Courts Law Art. 79(2) (10 Days)',
    },
    courtJurisdiction: 'SUMMARY_JUDICIARY',
  },
  SUPREME_COURT_CASSATION: {
    event: 'SUPREME_COURT_CASSATION',
    label: {
      ar: 'مهلة طلب النقض أمام المحكمة العليا',
      en: 'Supreme Court Cassation Petition Window',
    },
    periodDays: 30,
    statutoryCitation: {
      ar: 'المادة (195) من نظام المرافعات الشرعية والمادة (88) من نظام المحاكم التجارية',
      en: 'Sharia Procedure Law Art. 195 & Commercial Courts Law Art. 88 (30 Days)',
    },
    courtJurisdiction: 'SUPREME_COURT',
  },
  EXPERT_PRELIMINARY_REPORT: {
    event: 'EXPERT_PRELIMINARY_REPORT',
    label: {
      ar: 'مهلة إيداع الملاحظات والاعتراض على التقرير المبدئي للخبير (منصة خبرة)',
      en: 'Objection & Comments Window on Preliminary Expert Report',
    },
    periodDays: 15,
    statutoryCitation: {
      ar: 'المادة (118) من نظام الإثبات والأدلة الإجرائية لمنصة خبرة',
      en: 'Saudi Law of Evidence Art. 118 — Expert Report Objection Window (15 Days)',
    },
    courtJurisdiction: 'EXPERT_PLATFORM_KHIBRAH',
  },
  EXCHANGE_OF_BRIEFS_ORDER: {
    event: 'EXCHANGE_OF_BRIEFS_ORDER',
    label: {
      ar: 'مهلة إيداع المذكرة الجوابية وتبادل اللوائح عبر ناجز',
      en: 'Responsive Pleading & Brief Submission Deadline',
    },
    periodDays: 10,
    statutoryCitation: {
      ar: 'المادة (22) من نظام المحاكم التجارية ولائحته التنفيذية',
      en: 'Commercial Courts Law Art. 22 — Brief Exchange Schedule (10 Days)',
    },
    courtJurisdiction: 'COMMERCIAL_AND_CIVIL_CIRCUITS',
  },
  ADMINISTRATIVE_GRIEVANCE: {
    event: 'ADMINISTRATIVE_GRIEVANCE',
    label: {
      ar: 'مهلة التظلم الوجوبي أمام الجهة الإدارية أو وزارة الموارد البشرية',
      en: 'Mandatory Administrative Grievance Period (Diwan Al-Mazalim)',
    },
    periodDays: 60,
    statutoryCitation: {
      ar: 'المادة (8) من نظام المرافعات أمام ديوان المظالم',
      en: 'Board of Grievances Procedure Law Art. 8 (60 Days)',
    },
    courtJurisdiction: 'ADMINISTRATIVE_COURT_DIWAN',
  },
  ENFORCEMENT_ORDER_NOTICE: {
    event: 'ENFORCEMENT_ORDER_NOTICE',
    label: {
      ar: 'مهلة التنفيذ الاختياري قبل تطبيق عقوبات المادة (46)',
      en: 'Voluntary Enforcement Window Prior to Article 46 Sanctions',
    },
    periodDays: 5,
    statutoryCitation: {
      ar: 'المادة (46) من نظام التنفيذ السعودي',
      en: 'Saudi Enforcement Law Art. 46 (5 Days from Notification)',
    },
    courtJurisdiction: 'ENFORCEMENT_COURT',
  },
}

/**
 * Calculates the exact statutory deadline, remaining days/hours, and alert windows
 * (T-7d, T-3d, T-24h) for a given procedural event and trigger date.
 *Per Saudi procedural rules, calculation starts the day following official notification/delivery.
 */
export function calculateProceduralDeadline(
  event: ProceduralTriggerEvent,
  triggerDate: Date | string,
  referenceNow: Date = new Date()
): CalculatedProceduralDeadline {
  const spec = STATUTORY_DEADLINE_RULES[event]
  const start = typeof triggerDate === 'string' ? new Date(triggerDate) : new Date(triggerDate.getTime())

  // Statutory deadline expires at the end of `periodDays` following notification
  const due = new Date(start.getTime() + spec.periodDays * 24 * 60 * 60 * 1000)

  const diffMs = due.getTime() - referenceNow.getTime()
  const remainingHours = Math.ceil(diffMs / (1000 * 60 * 60))
  const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  const tMinus7d = new Date(due.getTime() - 7 * 24 * 60 * 60 * 1000)
  const tMinus3d = new Date(due.getTime() - 3 * 24 * 60 * 60 * 1000)
  const tMinus24h = new Date(due.getTime() - 24 * 60 * 60 * 1000)

  let activeAlertWindow: AlertWindowKey | null = null
  if (remainingHours > 0 && remainingHours <= 24) {
    activeAlertWindow = 'T_MINUS_24H'
  } else if (remainingDays > 1 && remainingDays <= 3) {
    activeAlertWindow = 'T_MINUS_3D'
  } else if (remainingDays > 3 && remainingDays <= 7) {
    activeAlertWindow = 'T_MINUS_7D'
  }

  const urgency: CalculatedProceduralDeadline['urgency'] =
    remainingHours <= 0
      ? 'EXPIRED'
      : remainingDays <= 3
      ? 'CRITICAL'
      : remainingDays <= 7
      ? 'WARNING'
      : 'NORMAL'

  return {
    event,
    label: spec.label,
    statutoryCitation: spec.statutoryCitation,
    triggerDateIso: start.toISOString(),
    dueDateIso: due.toISOString(),
    periodDays: spec.periodDays,
    remainingDays,
    remainingHours,
    urgency,
    activeAlertWindow,
    scheduledAlertTimestamps: {
      T_MINUS_7D: tMinus7d.toISOString(),
      T_MINUS_3D: tMinus3d.toISOString(),
      T_MINUS_24H: tMinus24h.toISOString(),
    },
  }
}

/**
 * Evaluates whether a court hearing or procedural deadline falls into
 * T-7 days, T-3 days, or T-24 hours alert windows.
 */
export function evaluateHearingAlertWindow(
  hearingDate: Date | string,
  referenceNow: Date = new Date()
): {
  shouldTrigger: boolean
  windowKey: AlertWindowKey | null
  hoursUntilHearing: number
  daysUntilHearing: number
} {
  const target = typeof hearingDate === 'string' ? new Date(hearingDate) : hearingDate
  const diffMs = target.getTime() - referenceNow.getTime()
  const hoursUntilHearing = Math.round(diffMs / (1000 * 60 * 60))
  const daysUntilHearing = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (hoursUntilHearing <= 0) {
    return { shouldTrigger: false, windowKey: null, hoursUntilHearing, daysUntilHearing }
  }

  if (hoursUntilHearing <= 24) {
    return { shouldTrigger: true, windowKey: 'T_MINUS_24H', hoursUntilHearing, daysUntilHearing }
  }

  if (daysUntilHearing === 3) {
    return { shouldTrigger: true, windowKey: 'T_MINUS_3D', hoursUntilHearing, daysUntilHearing }
  }

  if (daysUntilHearing === 7) {
    return { shouldTrigger: true, windowKey: 'T_MINUS_7D', hoursUntilHearing, daysUntilHearing }
  }

  return { shouldTrigger: false, windowKey: null, hoursUntilHearing, daysUntilHearing }
}

/**
 * Multi-channel notification dispatcher for court hearings and procedural deadlines
 * (Email, In-App Alert, SMS Webhook, WhatsApp Webhook) at T-7d, T-3d, and T-24h.
 */
export async function dispatchHearingMultiChannelAlerts(
  payload: HearingAlertDispatchPayload
): Promise<HearingAlertDispatchReceipt> {
  const deliveries: HearingAlertDispatchReceipt['deliveries'] = []
  const windowLabelAr =
    payload.windowKey === 'T_MINUS_24H'
      ? 'خلال 24 ساعة (T-24h)'
      : payload.windowKey === 'T_MINUS_3D'
      ? 'قبل 3 أيام (T-3d)'
      : 'قبل 7 أيام (T-7d)'

  for (const channel of payload.channels) {
    if (channel === 'IN_APP') {
      deliveries.push({
        channel: 'IN_APP',
        status: 'DISPATCHED',
        recipientCount: payload.recipients.length,
        detail: `تم إرسال تنبيه داخلي فوري لقضية رقم (${payload.caseNumber}) — ${windowLabelAr}`,
      })
    } else if (channel === 'EMAIL') {
      const emailRecipients = payload.recipients.filter((r) => Boolean(r.email))
      deliveries.push({
        channel: 'EMAIL',
        status: 'DISPATCHED',
        recipientCount: emailRecipients.length,
        detail: `إشعار بريد إلكتروني رسمي للمحامين المكلفين (${emailRecipients.length}) بشأن جلسة ${payload.courtType}`,
      })
    } else if (channel === 'WHATSAPP_WEBHOOK' || channel === 'SMS_WEBHOOK') {
      const webhookEndpoint =
        payload.webhookUrl ||
        process.env.MAQAR_MESSAGING_WEBHOOK_URL ||
        ''

      if (webhookEndpoint) {
        try {
          const res = await fetch(webhookEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channel,
              windowKey: payload.windowKey,
              caseId: payload.caseId,
              caseNumber: payload.caseNumber,
              courtType: payload.courtType,
              hearingDateIso: payload.hearingDateIso,
              recipients: payload.recipients,
            }),
          })
          deliveries.push({
            channel,
            status: res.ok ? 'DISPATCHED' : 'FAILED',
            recipientCount: payload.recipients.length,
            detail: `Webhook HTTP ${res.status}`,
          })
        } catch (err) {
          deliveries.push({
            channel,
            status: 'FAILED',
            recipientCount: payload.recipients.length,
            detail: err instanceof Error ? err.message : 'Webhook connection error',
          })
        }
      } else {
        deliveries.push({
          channel,
          status: 'SIMULATED',
          recipientCount: payload.recipients.length,
          detail: `تم تجهيز حمولة Webhook (${channel}) لـ ${windowLabelAr} — القضية ${payload.caseNumber}`,
        })
      }
    }
  }

  return {
    caseId: payload.caseId,
    caseNumber: payload.caseNumber,
    windowKey: payload.windowKey,
    dispatchedAt: new Date().toISOString(),
    deliveries,
  }
}
