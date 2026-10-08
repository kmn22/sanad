import { db } from '@/lib/db'

/**
 * Retention sweep — permanently removes records that were soft-deleted longer
 * than the workspace's RetentionPolicy allows. Records under an active
 * LegalHold are never purged. Also drops expired auth artefacts that otherwise
 * accumulate forever (rate-limit buckets, verification/reset tokens).
 */

const DAY_MS = 24 * 60 * 60 * 1000

// entityType -> Prisma delegate name. Only soft-deletable models participate;
// anything else in a policy is ignored (no accidental hard deletes).
const SOFT_DELETABLE: Record<string, string> = {
  LegalCase: 'legalCase',
  Client: 'client',
  LegalDocument: 'legalDocument',
  Task: 'task',
  Communication: 'communication',
  ComplianceItem: 'complianceItem',
  TimeEntry: 'timeEntry',
  Invoice: 'invoice',
}

export async function runRetentionSweep(now = new Date()) {
  let purged = 0

  const policies = await db.retentionPolicy.findMany({ where: { active: true } })
  const holds = await db.legalHold.findMany({
    where: { releasedAt: null },
    select: { entityType: true, entityId: true },
  })
  const held = new Set(holds.map((h) => `${h.entityType}:${h.entityId}`))

  for (const policy of policies) {
    const delegate = SOFT_DELETABLE[policy.entityType] as keyof typeof db | undefined
    if (!delegate || policy.retentionDays < 0) continue
    const cutoff = new Date(now.getTime() - policy.retentionDays * DAY_MS)
    const candidates = await (db as any)[delegate].findMany({
      where: { workspaceId: policy.workspaceId, deletedAt: { not: null, lt: cutoff } },
      select: { id: true },
      take: 500,
    })
    const ids = candidates.map((c: { id: string }) => c.id).filter((id: string) => !held.has(`${policy.entityType}:${id}`))
    if (ids.length > 0) {
      const result = await (db as any)[delegate].deleteMany({ where: { id: { in: ids } } })
      purged += result.count
    }
  }

  // Expired auth/verification hygiene — independent of workspace policies.
  const staleWindow = new Date(now.getTime() - DAY_MS)
  const [rateLimits, verifyTokens, resetTokens] = await Promise.all([
    db.authRateLimit.deleteMany({
      where: { updatedAt: { lt: staleWindow }, OR: [{ blockedUntil: null }, { blockedUntil: { lt: now } }] },
    }),
    db.verificationToken.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.passwordResetToken.deleteMany({ where: { expiresAt: { lt: now } } }),
  ])
  purged += rateLimits.count + verifyTokens.count + resetTokens.count

  return { purged }
}
