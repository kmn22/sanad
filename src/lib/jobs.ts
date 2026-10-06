import { db } from '@/lib/db'
import { emailConfigured, sendTransactionalEmail } from '@/lib/email'
import { incrementUsage } from '@/lib/saas/entitlements'

export type JobType = 'email.send' | 'notification.email' | 'reminders.sweep'

const MAX_BATCH = 50

export async function enqueueJob(
  type: JobType,
  payload: Record<string, unknown>,
  options: { workspaceId?: string | null; runAt?: Date; maxAttempts?: number } = {},
) {
  return db.backgroundJob.create({
    data: {
      workspaceId: options.workspaceId || null,
      type,
      payload: JSON.stringify(payload),
      runAt: options.runAt || new Date(),
      maxAttempts: options.maxAttempts ?? 5,
    },
  })
}

function backoffMinutes(attempts: number) {
  return Math.min(2 ** attempts, 60)
}

async function claimJob() {
  const candidates = await db.backgroundJob.findMany({
    where: { status: 'queued', runAt: { lte: new Date() } },
    orderBy: { runAt: 'asc' },
    take: 10,
    select: { id: true },
  })
  for (const candidate of candidates) {
    const claimed = await db.backgroundJob.updateMany({
      where: { id: candidate.id, status: 'queued' },
      data: { status: 'processing', lockedAt: new Date(), attempts: { increment: 1 } },
    })
    if (claimed.count === 1) {
      return db.backgroundJob.findUnique({ where: { id: candidate.id } })
    }
  }
  return null
}

async function failJob(jobId: string, attempts: number, maxAttempts: number, error: unknown) {
  const lastError = error instanceof Error ? error.message.slice(0, 1000) : 'Unknown error'
  if (attempts >= maxAttempts) {
    await db.backgroundJob.update({ where: { id: jobId }, data: { status: 'failed', lastError } })
  } else {
    await db.backgroundJob.update({
      where: { id: jobId },
      data: { status: 'queued', lastError, runAt: new Date(Date.now() + backoffMinutes(attempts) * 60_000) },
    })
  }
}

async function userNotificationPreference(userId: string, type: string) {
  const pref = await db.notificationPreference.findUnique({ where: { userId_type: { userId, type } } })
  return pref || { inApp: true, email: true, quietStart: null, quietEnd: null }
}

/** Minutes until quiet hours end; 0 when the user is not in quiet hours now. */
export function quietDelayMinutes(quietStart: string | null, quietEnd: string | null, now = new Date()) {
  if (!quietStart || !quietEnd || !/^\d{2}:\d{2}$/.test(quietStart) || !/^\d{2}:\d{2}$/.test(quietEnd)) return 0
  const [sh, sm] = quietStart.split(':').map(Number)
  const [eh, em] = quietEnd.split(':').map(Number)
  const minutes = now.getHours() * 60 + now.getMinutes()
  const start = sh * 60 + sm
  const end = eh * 60 + em
  const inQuiet = start <= end ? minutes >= start && minutes < end : minutes >= start || minutes < end
  if (!inQuiet) return 0
  const delay = (end - minutes + 1440) % 1440
  return delay || 1440
}

async function handleJob(job: { id: string; type: string; payload: string; workspaceId: string | null }) {
  const payload = JSON.parse(job.payload) as Record<string, unknown>

  if (job.type === 'email.send') {
    if (!emailConfigured()) throw new Error('SMTP is not configured')
    await sendTransactionalEmail({
      to: String(payload.to || ''),
      subject: String(payload.subject || ''),
      heading: String(payload.heading || ''),
      text: String(payload.text || ''),
      actionUrl: typeof payload.actionUrl === 'string' ? payload.actionUrl : undefined,
      actionLabel: typeof payload.actionLabel === 'string' ? payload.actionLabel : undefined,
    })
    if (job.workspaceId) await incrementUsage(job.workspaceId, 'emails')
    return
  }

  if (job.type === 'notification.email') {
    if (!emailConfigured()) return
    const userIds = Array.isArray(payload.userIds) ? (payload.userIds as string[]) : []
    const users = await db.user.findMany({ where: { id: { in: userIds }, disabledAt: null }, select: { id: true, email: true } })
    for (const user of users) {
      const pref = await userNotificationPreference(user.id, String(payload.type || 'system'))
      if (!pref.email) continue
      const delay = quietDelayMinutes(pref.quietStart, pref.quietEnd)
      if (delay > 0) {
        await enqueueJob('notification.email', { ...payload, userIds: [user.id] }, { workspaceId: job.workspaceId, runAt: new Date(Date.now() + delay * 60_000) })
        continue
      }
      await sendTransactionalEmail({
        to: user.email,
        subject: String(payload.title || 'Sanad notification'),
        heading: String(payload.title || 'Sanad notification'),
        text: String(payload.body || ''),
        actionUrl: typeof payload.link === 'string' ? payload.link : undefined,
        actionLabel: 'فتح في سند',
      })
      if (job.workspaceId) await incrementUsage(job.workspaceId, 'emails')
    }
    return
  }

  if (job.type === 'reminders.sweep') {
    const { runAutomatedReminders } = await import('@/lib/reminders')
    await runAutomatedReminders()
    return
  }

  throw new Error(`Unsupported job type: ${job.type}`)
}

/** Ensure recurring platform jobs always have one queued run pending. */
export async function ensureRecurringJobs() {
  const pending = await db.backgroundJob.findFirst({ where: { type: 'reminders.sweep', status: { in: ['queued', 'processing'] } }, select: { id: true } })
  if (!pending) {
    await enqueueJob('reminders.sweep', {}, { runAt: new Date(Date.now() + 15 * 60_000), maxAttempts: 3 })
  }
}

export async function processDueJobs(limit = MAX_BATCH) {
  let processed = 0
  let failed = 0
  for (let index = 0; index < limit; index += 1) {
    const job = await claimJob()
    if (!job) break
    try {
      await handleJob(job)
      await db.backgroundJob.update({ where: { id: job.id }, data: { status: 'completed', completedAt: new Date() } })
      processed += 1
    } catch (error) {
      await failJob(job.id, job.attempts, job.maxAttempts, error)
      failed += 1
    }
  }
  await ensureRecurringJobs()
  return { processed, failed }
}
