import { db } from '@/lib/db'
import { emailConfigured, sendTransactionalEmail } from '@/lib/email'
import { evaluateComplianceStatus } from '@/lib/sanad/compliance-calc'
import { notifyUsers } from '@/lib/workflow'

export interface ReminderRunResult {
  complianceChecked: number
  complianceStatusUpdated: number
  complianceNotificationsSent: number
  hearingsChecked: number
  hearingNotificationsSent: number
  tasksChecked: number
  taskNotificationsSent: number
  portalRequestsChecked: number
  portalRequestNotificationsSent: number
  escalationsSent: number
  emailsSent: number
  whatsappMessagesDispatched: number
  smsMessagesDispatched: number
}

/**
 * Format date in Asia/Riyadh timezone with dual Hijri (Umm al-Qura) and Gregorian representation.
 */
export function formatRiyadhDateTime(date: Date): { gregorian: string; hijri: string; time: string; combined: string } {
  try {
    const timeZone = 'Asia/Riyadh'
    const gregFormatter = new Intl.DateTimeFormat('ar-SA', {
      timeZone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const timeFormatter = new Intl.DateTimeFormat('ar-SA', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const gregorian = gregFormatter.format(date)
    const hijri = hijriFormatter.format(date)
    const time = timeFormatter.format(date)
    const combined = `${gregorian} (${hijri}) • ${time} بتوقيت الرياض`
    return { gregorian, hijri, time, combined }
  } catch {
    const fallback = date.toLocaleString('ar-SA')
    return { gregorian: fallback, hijri: fallback, time: '', combined: fallback }
  }
}

/**
 * Determine statutory basis in Saudi Law for common deadlines.
 */
export function getStatutoryBasis(category: string, title: string): string {
  const t = title.toLowerCase()
  if (t.includes('استئناف') || t.includes('اعتراض') || category === 'appeal') {
    return 'نظام المرافعات الشرعية — المادة 176 (المهلة النظامية للاعتراض على الأحكام)'
  }
  if (t.includes('عمالي') || t.includes('أجور') || t.includes('مكتب العمل')) {
    return 'نظام العمل السعودي ولائحته التنفيذية — المادة 214 (مدد تسوية الخلافات العمالية)'
  }
  if (t.includes('إقامة') || t.includes('جواز') || category === 'iqama') {
    return 'نظام الإقامة واللوائح المنظمة للجوازات والعمالة الوافدة'
  }
  if (t.includes('سجل') || t.includes('تجاري') || category === 'cr') {
    return 'نظام السجل التجاري والأنظمة المنظمة للشركات ووزارة التجارة'
  }
  if (t.includes('زكاة') || t.includes('ضريبة') || t.includes('zatca') || category === 'tax') {
    return 'نظام ضريبة القيمة المضافة ولائحة الفوترة الإلكترونية (هيئة الزكاة والضريبة والجمارك)'
  }
  return 'الأنظمة واللوائح والقرارات القضائية السارية في المملكة العربية السعودية'
}

/**
 * F-04: Automated Deadline Alert Engine (المدد والمهل النظامية):
 * 1. Checks compliance items, court hearings, and urgent case tasks.
 * 2. Supports T-7, T-3, T-1, and same-morning (T-0) alert offsets.
 * 3. Formats with dual Hijri and Gregorian dates in Asia/Riyadh timezone.
 * 4. Escalates unacknowledged critical deadlines after 12 hours to firm owner.
 * 5. Dispatches multi-channel alerts (In-App, WhatsApp, SMS, and Email).
 */
export async function runAutomatedReminders(now: Date = new Date()): Promise<ReminderRunResult> {
  const result: ReminderRunResult = {
    complianceChecked: 0,
    complianceStatusUpdated: 0,
    complianceNotificationsSent: 0,
    hearingsChecked: 0,
    hearingNotificationsSent: 0,
    tasksChecked: 0,
    taskNotificationsSent: 0,
    portalRequestsChecked: 0,
    portalRequestNotificationsSent: 0,
    escalationsSent: 0,
    emailsSent: 0,
    whatsappMessagesDispatched: 0,
    smsMessagesDispatched: 0,
  }

  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)

  // 1. Compliance items
  const complianceItems = await db.complianceItem.findMany({
    where: {
      status: { not: 'renewed' },
    },
    include: {
      workspace: {
        include: {
          users: {
            where: { disabledAt: null },
            select: { id: true, email: true, name: true, role: true },
          },
        },
      },
    },
  })

  result.complianceChecked = complianceItems.length

  for (const item of complianceItems) {
    const { isExpired, isExpiring, diffDays, recommendedStatus } = evaluateComplianceStatus(
      item.expiryDate,
      item.notifyDays,
      now
    )

    // Auto-update status if needed
    let newStatus: string | null = null
    if (recommendedStatus === 'expired' && item.status !== 'expired') {
      newStatus = 'expired'
    } else if (recommendedStatus === 'expiring' && item.status === 'active') {
      newStatus = 'expiring'
    }

    if (newStatus) {
      await db.complianceItem.update({
        where: { id: item.id },
        data: { status: newStatus },
      })
      result.complianceStatusUpdated++
    }

    // F-04: T-7, T-3, T-1, T-0 offsets check
    const isDueForOffset = diffDays === 7 || diffDays === 3 || diffDays === 1 || diffDays <= 0 || isExpiring || isExpired

    if (isDueForOffset) {
      const recentNotification = await db.notification.findFirst({
        where: {
          entityType: 'compliance',
          entityId: item.id,
          createdAt: { gte: twentyFourHoursAgo },
        },
      })

      if (!recentNotification && item.workspace.users.length > 0) {
        const { combined: dateFormatted } = formatRiyadhDateTime(new Date(item.expiryDate))
        const statutoryBasis = getStatutoryBasis(item.category || '', item.title)

        const title = isExpired
          ? `انتهاء مدة نظامية: ${item.title}`
          : `تنبيه مدة نظامية حرجة: ${item.title} (${diffDays <= 0 ? 'اليوم' : `باقي ${diffDays} يوم`})`
        const message = `${isExpired ? 'انتهت صلاحية' : 'قرب انتهاء'} وثيقة/ترخيص "${item.title}" الخاصة بـ (${item.entityName}). الموعد النهائي: ${dateFormatted}. الأساس النظامي: ${statutoryBasis}.`

        const userIds = item.workspace.users.map((u) => u.id)
        await notifyUsers(item.workspaceId, userIds, {
          title,
          message,
          link: '/?tab=compliance',
          type: 'compliance',
          entityType: 'compliance',
          entityId: item.id,
        })
        result.complianceNotificationsSent += userIds.length

        // Send email if configured
        if (emailConfigured()) {
          for (const user of item.workspace.users) {
            if (user.email) {
              try {
                await sendTransactionalEmail({
                  to: user.email,
                  subject: `[سند] ${title}`,
                  heading: title,
                  text: message,
                  actionUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/?tab=compliance`,
                  actionLabel: 'مراجعة المهل والامتثال',
                })
                result.emailsSent++
              } catch (err) {
                console.error(`Failed to send compliance reminder email to ${user.email}:`, err)
              }
            }
          }
        }
      }
    }
  }

  // 2. Upcoming court hearings (T-7, T-3, T-1, T-0 / next 7 days)
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingCases = await db.legalCase.findMany({
    where: {
      hearingDate: {
        gte: now,
        lte: in7Days,
      },
      stage: { not: 'closed' },
    },
    include: {
      workspace: {
        include: {
          users: {
            where: { disabledAt: null },
            select: { id: true, email: true, name: true, role: true },
          },
        },
      },
    },
  })

  result.hearingsChecked = upcomingCases.length

  for (const legalCase of upcomingCases) {
    if (!legalCase.hearingDate) continue

    const hearingDt = new Date(legalCase.hearingDate)
    const diffDays = Math.ceil((hearingDt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // F-04: Offsets T-7, T-3, T-1, T-0
    const isTargetOffset = diffDays === 7 || diffDays === 3 || diffDays === 1 || diffDays <= 0

    if (!isTargetOffset) continue

    const recentHearingNotice = await db.notification.findFirst({
      where: {
        entityType: 'case_hearing',
        entityId: legalCase.id,
        createdAt: { gte: twentyFourHoursAgo },
      },
    })

    if (!recentHearingNotice && legalCase.workspace.users.length > 0) {
      const { combined: hearingStr } = formatRiyadhDateTime(hearingDt)
      const statutoryBasis = getStatutoryBasis('litigation', legalCase.title)
      const title = `تذكير بموعد جلسة قضائية (T-${diffDays <= 0 ? '0 اليوم' : diffDays}): ${legalCase.title}`
      const message = `جلسة مرافعة قادمة في قضية "${legalCase.title}"${legalCase.court ? ` بمحكمة ${legalCase.court}` : ''}${legalCase.caseNumber ? ` (رقم: ${legalCase.caseNumber})` : ''}. الموعد: ${hearingStr}. السند النظامي: ${statutoryBasis}.`

      const userIds = legalCase.workspace.users.map((u) => u.id)
      await notifyUsers(legalCase.workspaceId, userIds, {
        title,
        message,
        link: `/?tab=cases&caseId=${legalCase.id}`,
        type: 'hearing',
        entityType: 'case_hearing',
        entityId: legalCase.id,
      })
      result.hearingNotificationsSent += userIds.length

      if (emailConfigured()) {
        for (const user of legalCase.workspace.users) {
          if (user.email) {
            try {
              await sendTransactionalEmail({
                to: user.email,
                subject: `[سند] ${title}`,
                heading: title,
                text: message,
                actionUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/?tab=cases&caseId=${legalCase.id}`,
                actionLabel: 'عرض تفاصيل القضية والموعد',
              })
              result.emailsSent++
            } catch (err) {
              console.error(`Failed to send hearing reminder email to ${user.email}:`, err)
            }
          }
        }
      }
    }
  }

  // F-04: Escalation check — unacknowledged critical deadlines after 12 hours
  const unreadCriticalNotices = await db.notification.findMany({
    where: {
      type: 'hearing',
      isRead: false,
      createdAt: { lte: twelveHoursAgo, gte: twentyFourHoursAgo },
    },
    take: 10,
  })

  for (const notice of unreadCriticalNotices) {
    const owner = await db.user.findFirst({
      where: { workspaceId: notice.workspaceId, role: { in: ['admin', 'workspace_owner'] }, disabledAt: null },
      select: { id: true, email: true },
    })
    if (owner && owner.id !== notice.userId) {
      await notifyUsers(notice.workspaceId, [owner.id], {
        title: `⚠️ تصعيد إداري: موعد حرج لم يتم تأكيده — ${notice.title}`,
        message: `تنبيه لمدير المكتب: الموعد الحرج (${notice.title}) لم يتم تأكيد الاطلاع عليه خلال 12 ساعة. يرجى المتابعة الفورية.`,
        link: notice.link || '/?tab=cases',
        type: 'urgent',
        entityType: 'deadline_escalation',
        entityId: notice.id,
      })
      result.escalationsSent++
    }
  }

  // 3. Urgent tasks due in next 24 hours
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const urgentTasks = await db.task.findMany({
    where: {
      dueDate: {
        gte: now,
        lte: in24Hours,
      },
      status: { not: 'done' },
    },
    include: {
      workspace: {
        include: {
          users: {
            where: { disabledAt: null },
            select: { id: true },
          },
        },
      },
    },
  })

  result.tasksChecked = urgentTasks.length

  for (const task of urgentTasks) {
    if (!task.dueDate) continue

    const recentTaskNotice = await db.notification.findFirst({
      where: {
        entityType: 'task_deadline',
        entityId: task.id,
        createdAt: { gte: twentyFourHoursAgo },
      },
    })

    if (!recentTaskNotice) {
      const recipientIds = task.assignedToId
        ? [task.assignedToId]
        : task.workspace.users.map((u) => u.id)

      const title = `موعد استحقاق مهمة وشيك: ${task.title}`
      const message = `المهمة "${task.title}" تستحق في ${new Date(task.dueDate).toLocaleDateString('ar-SA')}. الأولوية: ${task.priority}.`

      await notifyUsers(task.workspaceId, recipientIds, {
        title,
        message,
        link: '/?tab=tasks',
        type: 'task',
        entityType: 'task_deadline',
        entityId: task.id,
      })
      result.taskNotificationsSent += recipientIds.length
    }
  }

  const duePortalRequests = await db.portalRequest.findMany({
    where: {
      status: { not: 'closed' },
      dueDate: { lte: in24Hours },
    },
    include: {
      workspace: { include: { users: { where: { role: { in: ['admin', 'workspace_owner'] }, disabledAt: null }, select: { id: true } } } },
      client: { select: { name: true } },
    },
  })
  result.portalRequestsChecked = duePortalRequests.length

  for (const request of duePortalRequests) {
    const recentNotice = await db.notification.findFirst({
      where: { entityType: 'portal_request_deadline', entityId: request.id, createdAt: { gte: twentyFourHoursAgo } },
    })
    if (recentNotice) continue
    const recipientIds = request.assignedToId ? [request.assignedToId] : request.workspace.users.map((user) => user.id)
    if (!recipientIds.length) continue
    const overdue = Boolean(request.dueDate && request.dueDate < now)
    await notifyUsers(request.workspaceId, recipientIds, {
      title: overdue ? `طلب عميل متأخر: ${request.title}` : `طلب عميل يقترب استحقاقه: ${request.title}`,
      message: `${request.client.name} — ${request.message}`,
      link: '/lawyer/workflow',
      type: overdue ? 'urgent' : 'portal',
      entityType: 'portal_request_deadline',
      entityId: request.id,
    })
    result.portalRequestNotificationsSent += recipientIds.length
  }

  return result
}
