import crypto from 'crypto'
import { db } from '@/lib/db'

type RateLimitRow = {
  attempts: number
  windowStart: Date
  blockedUntil: Date | null
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  blockMs = windowMs
): Promise<{ success: boolean; remaining: number; resetAt: Date }> {
  const now = new Date()
  const windowStartBoundary = new Date(now.getTime() - windowMs)
  const blockUntil = new Date(now.getTime() + blockMs)
  const id = crypto.randomUUID()

  // Single atomic statement: the increment and the window/block decisions are
  // evaluated by the database against the current row, so concurrent requests
  // cannot race a read-modify-write and slip past the limit.
  const rows = await db.$queryRaw<RateLimitRow[]>`
    INSERT INTO "AuthRateLimit" ("id", "key", "attempts", "windowStart", "blockedUntil", "updatedAt")
    VALUES (${id}, ${key}, 1, ${now}, NULL, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "attempts" = CASE
        WHEN "AuthRateLimit"."blockedUntil" > ${now} THEN "AuthRateLimit"."attempts"
        WHEN "AuthRateLimit"."windowStart" <= ${windowStartBoundary} THEN 1
        ELSE "AuthRateLimit"."attempts" + 1
      END,
      "windowStart" = CASE
        WHEN "AuthRateLimit"."blockedUntil" > ${now} THEN "AuthRateLimit"."windowStart"
        WHEN "AuthRateLimit"."windowStart" <= ${windowStartBoundary} THEN ${now}
        ELSE "AuthRateLimit"."windowStart"
      END,
      "blockedUntil" = CASE
        WHEN "AuthRateLimit"."blockedUntil" > ${now} THEN "AuthRateLimit"."blockedUntil"
        WHEN "AuthRateLimit"."windowStart" <= ${windowStartBoundary} THEN NULL
        WHEN ("AuthRateLimit"."attempts" + 1) > ${limit} THEN ${blockUntil}
        ELSE "AuthRateLimit"."blockedUntil"
      END,
      "updatedAt" = ${now}
    RETURNING "attempts", "windowStart", "blockedUntil"
  `

  const row = rows[0]
  const blocked = row.blockedUntil !== null && row.blockedUntil > now
  const resetAt = blocked
    ? row.blockedUntil!
    : new Date(row.windowStart.getTime() + windowMs)

  return {
    success: !blocked && row.attempts <= limit,
    remaining: Math.max(0, limit - row.attempts),
    resetAt,
  }
}

export async function clearRateLimit(key: string) {
  await db.authRateLimit.deleteMany({ where: { key } })
}
