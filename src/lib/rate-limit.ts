import { db } from '@/lib/db'

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  blockMs = windowMs
): Promise<{ success: boolean; remaining: number; resetAt: Date }> {
  const now = new Date()
  const entry = await db.authRateLimit.findUnique({ where: { key } })

  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return { success: false, remaining: 0, resetAt: entry.blockedUntil }
  }

  if (!entry || now.getTime() - entry.windowStart.getTime() >= windowMs) {
    const resetAt = new Date(now.getTime() + windowMs)
    await db.authRateLimit.upsert({
      where: { key },
      create: { key, attempts: 1, windowStart: now },
      update: { attempts: 1, windowStart: now, blockedUntil: null },
    })
    return { success: true, remaining: limit - 1, resetAt }
  }

  const attempts = entry.attempts + 1
  const blockedUntil = attempts > limit ? new Date(now.getTime() + blockMs) : null
  await db.authRateLimit.update({ where: { key }, data: { attempts, blockedUntil } })

  return {
    success: !blockedUntil,
    remaining: Math.max(0, limit - attempts),
    resetAt: blockedUntil || new Date(entry.windowStart.getTime() + windowMs),
  }
}

export async function clearRateLimit(key: string) {
  await db.authRateLimit.deleteMany({ where: { key } })
}
