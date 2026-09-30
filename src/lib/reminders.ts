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
  emailsSent: number
}

/**
 * Automated reminder engine:
 * 1. Checks expiring & expired compliance items, updates their status, and creates notifications.
 * 2. Checks court hearings scheduled in the next 48 hours and notifies assigned counsel / workspace members.
 * 3. Checks urgent pending tasks due in the next 24 hours.
 *
 * All notifications are deduplicated against a 24-hour window to prevent notification spam.
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
    emailsSent: 0,
  }

  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

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
            select: { id: true, email: true, name: true },
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

    // If item is expiring or expired, notify workspace users if not notified in past 24h
    if (isExpired || isExpiring) {
      const recentNotification = await db.notification.findFirst({
        where: {
          entityType: 'compliance',
          entityId: item.id,
          createdAt: { gte: twentyFourHoursAgo },
        },
      })

      if (!recentNotification && item.workspace.users.length > 0) {
        const title = isExpired
          ? `انتهاء صلاحية: ${item.title}`
          : `تنبيه قرب انتهاء: ${item.title} (${diffDays} يوم متبقٍ)`
        const message = isExpired
          ? `انتهت صلاحية وثيقة/ترخيص "${item.title}" الخاصة بـ (${item.entityName}) بتاريخ ${new Date(item.expiryDate).toLocaleDateString('ar-SA')}. يرجى التجديد فوراً.`
          : `تنتهي صلاحية وثيقة/ترخيص "${item.title}" الخاصة بـ (${item.entityName}) خلال ${diffDays} يوم بتاريخ ${new Date(item.expiryDate).toLocaleDateString('ar-SA')}.`

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
                  actionLabel: 'مراجعة قسم الامتثال',
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

  // 2. Upcoming court hearings (next 48 hours)
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000)
  const upcomingCases = await db.legalCase.findMany({
    where: {
      hearingDate: {
        gte: now,
        lte: in48Hours,
      },
      stage: { not: 'closed' },
    },
    include: {
      workspace: {
        include: {
          users: {
            where: { disabledAt: null },
            select: { id: true, email: true, name: true },
          },
        },
      },
    },
  })

  result.hearingsChecked = upcomingCases.length

  for (const legalCase of upcomingCases) {
    if (!legalCase.hearingDate) continue

    const recentHearingNotice = await db.notification.findFirst({
      where: {
        entityType: 'case_hearing',
        entityId: legalCase.id,
        createdAt: { gte: twentyFourHoursAgo },
      },
    })

    if (!recentHearingNotice && legalCase.workspace.users.length > 0) {
      const hearingStr = new Date(legalCase.hearingDate).toLocaleString('ar-SA', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      const title = `تذكير بموعد جلسة قضائية: ${legalCase.title}`
      const message = `جلسة قادمة في قضية "${legalCase.title}"${legalCase.court ? ` بمحكمة ${legalCase.court}` : ''}${legalCase.caseNumber ? ` (رقم: ${legalCase.caseNumber})` : ''} محددة بتاريخ: ${hearingStr}.`

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
                actionLabel: 'عرض تفاصيل القضية',
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

  return result
}
