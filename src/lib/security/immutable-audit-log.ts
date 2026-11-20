/**
 * ============================================================================
 * Maqar (مقر) Security Hardening — Immutable Digital Audit Log (سجل التدقيق الرقمي)
 * (`src/lib/security/immutable-audit-log.ts`)
 * ============================================================================
 *
 * Append-only cryptographic hash-chained `AuditLog` service aligned with
 * Saudi PDPL (Art. 19) and NCA Cloud Cybersecurity Controls (CCC-2-12):
 *   • Tracks mandatory security & governance actions:
 *       - DOCUMENT_VIEW
 *       - DOCUMENT_DOWNLOAD
 *       - DOCUMENT_EXPORT
 *       - ROLE_CHANGE
 *       - PERMISSION_OVERRIDE
 *       - CROSS_TENANT_ACCESS_BLOCKED
 *   • Each log entry embeds `previousEntryHash` and `entryHash` (HMAC-SHA256),
 *     enabling mathematical tamper detection (`verifyImmutableAuditChain`) on
 *     top of the PostgreSQL WORM `BEFORE UPDATE OR DELETE` trigger.
 */

import { createHmac } from 'node:crypto'
import { db } from '@/lib/db'

export type MandatoryAuditAction =
  | 'DOCUMENT_VIEW'
  | 'DOCUMENT_DOWNLOAD'
  | 'DOCUMENT_EXPORT'
  | 'ROLE_CHANGE'
  | 'PERMISSION_OVERRIDE'
  | 'CROSS_TENANT_ACCESS_BLOCKED'

export interface ImmutableAuditInput {
  workspaceId: string
  orgId?: string | null
  userId: string
  action: MandatoryAuditAction
  entityType: 'Document' | 'ContractLifecycle' | 'LitigationCase' | 'Membership' | 'Workspace'
  entityId: string
  ipAddress?: string
  details?: Record<string, unknown>
  timestamp?: Date
}

export interface ChainedAuditEnvelope {
  sequenceVersion: 'maqar-worm-v1'
  orgId?: string | null
  action: MandatoryAuditAction
  timestampIso: string
  previousHash: string
  entryHash: string
  details: Record<string, unknown>
}

export const GENESIS_AUDIT_CHAIN_HASH =
  '0000000000000000000000000000000000000000000000000000000000000000'

function getAuditHmacKey(): string {
  const secret =
    process.env.AUDIT_LOG_HMAC_SECRET ||
    process.env.DOCUMENT_SIGNATURE_KEY ||
    process.env.BACKUP_ENCRYPTION_KEY
  if (secret) return secret
  if (process.env.NODE_ENV === 'test') return 'maqar-test-audit-hmac-key'
  throw new Error('AUDIT_LOG_HMAC_SECRET (or DOCUMENT_SIGNATURE_KEY / BACKUP_ENCRYPTION_KEY) must be set')
}

/**
 * Computes the deterministic HMAC-SHA256 chain hash linking an audit record
 * to its predecessor (`previousHash`).
 */
export function computeAuditChainHash(params: {
  previousHash: string
  workspaceId: string
  userId: string
  action: MandatoryAuditAction
  entityType: string
  entityId: string
  timestampIso: string
  detailsJson: string
}): string {
  const canonical = [
    params.previousHash,
    params.workspaceId,
    params.userId,
    params.action,
    params.entityType,
    params.entityId,
    params.timestampIso,
    params.detailsJson,
  ].join('|')

  return createHmac('sha256', getAuditHmacKey()).update(canonical).digest('hex')
}

/**
 * Builds a tamper-evident hash-chained envelope ready for append-only insertion.
 */
export function buildChainedAuditRecord(
  input: ImmutableAuditInput,
  previousHash: string = GENESIS_AUDIT_CHAIN_HASH
): {
  envelope: ChainedAuditEnvelope
  serializedMetadata: string
} {
  const timestampIso = (input.timestamp ?? new Date()).toISOString()
  const details = input.details ?? {}
  const detailsJson = JSON.stringify(details)

  const entryHash = computeAuditChainHash({
    previousHash,
    workspaceId: input.workspaceId,
    userId: input.userId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    timestampIso,
    detailsJson,
  })

  const envelope: ChainedAuditEnvelope = {
    sequenceVersion: 'maqar-worm-v1',
    orgId: input.orgId ?? null,
    action: input.action,
    timestampIso,
    previousHash,
    entryHash,
    details,
  }

  return {
    envelope,
    serializedMetadata: JSON.stringify(envelope),
  }
}

/**
 * Verifies the cryptographic integrity of an ordered sequence of `AuditLog` entries.
 * Returns `{ intact: true }` if no entry was altered, reordered, or deleted.
 */
export function verifyImmutableAuditChain(
  records: Array<{
    workspaceId: string
    userId: string
    action: MandatoryAuditAction
    entityType: string
    entityId: string
    envelope: ChainedAuditEnvelope
  }>
): { intact: boolean; brokenAtIndex?: number } {
  let expectedPrevHash = GENESIS_AUDIT_CHAIN_HASH

  for (let i = 0; i < records.length; i++) {
    const rec = records[i]
    if (rec.envelope.previousHash !== expectedPrevHash) {
      return { intact: false, brokenAtIndex: i }
    }

    const recomputed = computeAuditChainHash({
      previousHash: rec.envelope.previousHash,
      workspaceId: rec.workspaceId,
      userId: rec.userId,
      action: rec.action,
      entityType: rec.entityType,
      entityId: rec.entityId,
      timestampIso: rec.envelope.timestampIso,
      detailsJson: JSON.stringify(rec.envelope.details),
    })

    if (recomputed !== rec.envelope.entryHash) {
      return { intact: false, brokenAtIndex: i }
    }

    expectedPrevHash = rec.envelope.entryHash
  }

  return { intact: true }
}

/**
 * Appends an immutable, hash-chained security audit entry into PostgreSQL (`AuditLog`
 * and `DataAccessEvent` for document read/download/export operations).
 */
export async function recordImmutableAuditEvent(
  input: ImmutableAuditInput
): Promise<ChainedAuditEnvelope> {
  let previousHash = GENESIS_AUDIT_CHAIN_HASH

  try {
    const latest = await db.auditLog.findFirst({
      where: { workspaceId: input.workspaceId },
      orderBy: { createdAt: 'desc' },
      select: { metadata: true },
    })

    if (latest?.metadata) {
      const parsed = JSON.parse(latest.metadata) as Partial<ChainedAuditEnvelope>
      if (parsed.entryHash && typeof parsed.entryHash === 'string') {
        previousHash = parsed.entryHash
      }
    }
  } catch {
    // Fallback to genesis hash if metadata is legacy or DB not reachable in unit test
  }

  const { envelope, serializedMetadata } = buildChainedAuditRecord(
    input,
    previousHash
  )

  await db.$transaction(async (tx) => {
    await tx.auditLog.create({
      data: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        ipAddress: input.ipAddress,
        metadata: serializedMetadata,
      },
    })

    if (
      input.action === 'DOCUMENT_VIEW' ||
      input.action === 'DOCUMENT_DOWNLOAD' ||
      input.action === 'DOCUMENT_EXPORT'
    ) {
      await tx.dataAccessEvent.create({
        data: {
          workspaceId: input.workspaceId,
          userId: input.userId,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          ipAddress: input.ipAddress,
        },
      })
    }
  })

  return envelope
}

