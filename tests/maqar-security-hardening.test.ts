import { describe, expect, it, beforeEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { withTenantRls } from '../src/lib/rls'
import {
  TenantIsolationViolationError,
  assertCrossTenantBoundary,
  buildTenantScopedWhere,
} from '../src/lib/security/tenant-guard'
import {
  decryptLegalVaultPayload,
  encryptLegalVaultPayload,
} from '../src/lib/security/vault-envelope-encryption'
import {
  GENESIS_AUDIT_CHAIN_HASH,
  buildChainedAuditRecord,
  verifyImmutableAuditChain,
} from '../src/lib/security/immutable-audit-log'
import {
  evaluateEdgeRateLimit,
  resetEdgeRateLimiterForTests,
  resolveRateLimitTier,
  validateTenantJwtClaims,
} from '../src/lib/security/edge-rate-limiter'

describe('Maqar Security Hardening — PDPL & NCA CCC Compliance Suite', () => {
  beforeEach(() => {
    resetEdgeRateLimiterForTests()
  })

  describe('1. Multi-Tenant Isolation & PostgreSQL Row-Level Security (RLS)', () => {
    it('blocks Firm A from accessing Firm B resources at the application guard layer', () => {
      const firmAActor = {
        userId: 'user-firm-a',
        workspaceId: 'ws-firm-a',
        orgId: 'org-firm-a',
        role: 'workspace_owner',
      }

      expect(() =>
        assertCrossTenantBoundary({
          actor: firmAActor,
          resourceWorkspaceId: 'ws-firm-b',
          resourceOrgId: 'org-firm-b',
        })
      ).toThrow(TenantIsolationViolationError)

      const scopedWhere = buildTenantScopedWhere(
        firmAActor,
        { status: 'ACTIVE' },
        true
      )
      expect(scopedWhere).toEqual({
        status: 'ACTIVE',
        workspaceId: 'ws-firm-a',
        orgId: 'org-firm-a',
      })
    })

    it('enforces PostgreSQL RLS isolation between Tenant 1 (National Tech) and Tenant 2 (Khaled Law Firm)', async () => {
      if (!process.env.DATABASE_URL) return
      const prisma = new PrismaClient()
      try {
        const tenant1Rls = withTenantRls(prisma, {
          orgId: 'org-maqar-national-tech',
          workspaceId: 'ws-maqar-national-tech-clm',
          userId: 'user-maqar-corp-director',
        })

        const tenant2Rls = withTenantRls(prisma, {
          orgId: 'org-maqar-khaled-lawfirm',
          workspaceId: 'ws-maqar-khaled-litigation',
          userId: 'user-maqar-managing-partner',
        })

        const corpContractsSeenByTenant1 =
          await tenant1Rls.contractLifecycle.findMany()
        const corpContractsSeenByTenant2 =
          await tenant2Rls.contractLifecycle.findMany()

        expect(corpContractsSeenByTenant1.length).toBeGreaterThanOrEqual(2)
        // Firm 2 (Khaled Law Firm) sees ZERO contracts belonging to Firm 1 (National Tech)
        expect(corpContractsSeenByTenant2).toHaveLength(0)
      } finally {
        await prisma.$disconnect()
      }
    })
  })

  describe('2. Envelope Encryption for Legal Vaults (AES-256-GCM + HKDF Tenant KEK)', () => {
    it('encrypts sensitive trade-secret attachments with per-file DEK and rejects cross-tenant decryption', () => {
      const secretAttachment = Buffer.from(
        'ملحق الأسرار التجارية والخوارزميات السيادية — سري للغاية',
        'utf8'
      )

      const envelope = encryptLegalVaultPayload(secretAttachment, {
        orgId: 'org-maqar-national-tech',
        workspaceId: 'ws-maqar-national-tech-clm',
        documentId: 'clm-national-tech-nda-01',
        classification: 'STRICT_TRADE_SECRET_CLM',
      })

      expect(envelope.algorithm).toBe('AES-256-GCM')
      expect(envelope.ciphertextBase64).not.toContain('ملحق')

      // Authorized Tenant decrypts successfully
      const decrypted = decryptLegalVaultPayload(envelope, {
        orgId: 'org-maqar-national-tech',
        workspaceId: 'ws-maqar-national-tech-clm',
        documentId: 'clm-national-tech-nda-01',
        classification: 'STRICT_TRADE_SECRET_CLM',
      })
      expect(decrypted.toString('utf8')).toBe(secretAttachment.toString('utf8'))

      // Cross-tenant attacker (Firm B) is cryptographically denied
      expect(() =>
        decryptLegalVaultPayload(envelope, {
          orgId: 'org-maqar-khaled-lawfirm',
          workspaceId: 'ws-maqar-khaled-litigation',
          documentId: 'clm-national-tech-nda-01',
          classification: 'STRICT_TRADE_SECRET_CLM',
        })
      ).toThrow(/VAULT_ACCESS_DENIED/)

      // Forged envelope orgId with Firm A ciphertext fails HKDF KEK & GCM AAD authentication
      const forgedEnvelope = {
        ...envelope,
        orgId: 'org-maqar-khaled-lawfirm',
        workspaceId: 'ws-maqar-khaled-litigation',
      }
      expect(() =>
        decryptLegalVaultPayload(forgedEnvelope, {
          orgId: 'org-maqar-khaled-lawfirm',
          workspaceId: 'ws-maqar-khaled-litigation',
          documentId: 'clm-national-tech-nda-01',
          classification: 'STRICT_TRADE_SECRET_CLM',
        })
      ).toThrow(/VAULT_CRYPTO_FAILURE/)
    })
  })

  describe('3. Immutable Digital Audit Log (سجل التدقيق الرقمي — Hash Chain & WORM)', () => {
    it('maintains a verifiable HMAC-SHA256 hash chain across document views, exports, role changes, and permission overrides', () => {
      const r1 = buildChainedAuditRecord(
        {
          workspaceId: 'ws-1',
          userId: 'u-1',
          action: 'DOCUMENT_VIEW',
          entityType: 'ContractLifecycle',
          entityId: 'doc-101',
          details: { ip: '10.0.0.1' },
        },
        GENESIS_AUDIT_CHAIN_HASH
      )

      const r2 = buildChainedAuditRecord(
        {
          workspaceId: 'ws-1',
          userId: 'u-1',
          action: 'DOCUMENT_EXPORT',
          entityType: 'ContractLifecycle',
          entityId: 'doc-101',
          details: { format: 'PDF' },
        },
        r1.envelope.entryHash
      )

      const r3 = buildChainedAuditRecord(
        {
          workspaceId: 'ws-1',
          userId: 'u-admin',
          action: 'ROLE_CHANGE',
          entityType: 'Membership',
          entityId: 'mem-55',
          details: { from: 'ASSOCIATE', to: 'SENIOR_LEGAL_COUNSEL' },
        },
        r2.envelope.entryHash
      )

      const r4 = buildChainedAuditRecord(
        {
          workspaceId: 'ws-1',
          userId: 'u-admin',
          action: 'PERMISSION_OVERRIDE',
          entityType: 'Membership',
          entityId: 'mem-55',
          details: { granted: ['clm:sign_dispatch'] },
        },
        r3.envelope.entryHash
      )

      const chain = [
        {
          workspaceId: 'ws-1',
          userId: 'u-1',
          action: 'DOCUMENT_VIEW' as const,
          entityType: 'ContractLifecycle',
          entityId: 'doc-101',
          envelope: r1.envelope,
        },
        {
          workspaceId: 'ws-1',
          userId: 'u-1',
          action: 'DOCUMENT_EXPORT' as const,
          entityType: 'ContractLifecycle',
          entityId: 'doc-101',
          envelope: r2.envelope,
        },
        {
          workspaceId: 'ws-1',
          userId: 'u-admin',
          action: 'ROLE_CHANGE' as const,
          entityType: 'Membership',
          entityId: 'mem-55',
          envelope: r3.envelope,
        },
        {
          workspaceId: 'ws-1',
          userId: 'u-admin',
          action: 'PERMISSION_OVERRIDE' as const,
          entityType: 'Membership',
          entityId: 'mem-55',
          envelope: r4.envelope,
        },
      ]

      expect(verifyImmutableAuditChain(chain)).toEqual({ intact: true })

      // Simulate tampering with entry #2's metadata
      const tamperedChain = chain.map((item, idx) =>
        idx === 1
          ? {
              ...item,
              envelope: { ...item.envelope, details: { format: 'DOCX_TAMPERED' } },
            }
          : item
      )
      expect(verifyImmutableAuditChain(tamperedChain)).toEqual({
        intact: false,
        brokenAtIndex: 1,
      })
    })
  })

  describe('4. Edge Rate Limiting & JWT Claim Validation', () => {
    it('enforces sliding-window ceilings on AUTH_STRICT endpoints and validates tenant JWT claims', () => {
      const now = 1_700_000_000_000
      for (let i = 0; i < 20; i++) {
        expect(evaluateEdgeRateLimit('203.0.113.50', 'AUTH_STRICT', now + i).allowed).toBe(
          true
        )
      }
      const blocked = evaluateEdgeRateLimit(
        '203.0.113.50',
        'AUTH_STRICT',
        now + 500
      )
      expect(blocked.allowed).toBe(false)
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0)

      expect(validateTenantJwtClaims(null)).toEqual({
        valid: false,
        reason: 'MISSING_TOKEN',
      })
      expect(
        validateTenantJwtClaims(
          { id: 'u-1', role: 'lawyer', workspaceId: 'ws-1', exp: 100 },
          200
        )
      ).toEqual({
        valid: false,
        reason: 'EXPIRED_TOKEN',
      })
      expect(
        validateTenantJwtClaims(
          { id: 'u-1', role: 'lawyer', exp: 500 },
          200
        )
      ).toEqual({
        valid: false,
        reason: 'MISSING_TENANT_SCOPE',
      })
      expect(resolveRateLimitTier('/api/auth/session')).toBe('STANDARD_API')
      expect(resolveRateLimitTier('/api/auth/providers')).toBe('STANDARD_API')
      expect(resolveRateLimitTier('/api/auth/csrf')).toBe('STANDARD_API')
      expect(resolveRateLimitTier('/api/auth/callback/credentials')).toBe('AUTH_STRICT')
      expect(resolveRateLimitTier('/api/auth/register')).toBe('AUTH_STRICT')

      expect(
        validateTenantJwtClaims(
          { id: 'u-1', role: 'lawyer', workspaceId: 'ws-1', exp: 500 },
          200
        )
      ).toEqual({
        valid: true,
      })
    })

    it('fails closed in production when vault KMS or audit HMAC secrets are missing', () => {
      const savedEnv = { ...process.env }
      try {
        ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'
        delete process.env.VAULT_MASTER_KMS_KEY
        delete process.env.FILE_ENCRYPTION_KEY
        delete process.env.BACKUP_ENCRYPTION_KEY
        delete process.env.AUDIT_LOG_HMAC_SECRET
        delete process.env.DOCUMENT_SIGNATURE_KEY

        expect(() =>
          encryptLegalVaultPayload(Buffer.from('secret'), {
            orgId: 'org-1',
            workspaceId: 'ws-1',
            documentId: 'doc-1',
            classification: 'CONFIDENTIAL_CASE_FILE',
          })
        ).toThrow(/VAULT_MASTER_KMS_KEY/)

        expect(() =>
          buildChainedAuditRecord(
            {
              workspaceId: 'ws-1',
              userId: 'u-1',
              action: 'DOCUMENT_VIEW',
              entityType: 'Document',
              entityId: 'doc-1',
            },
            GENESIS_AUDIT_CHAIN_HASH
          )
        ).toThrow(/AUDIT_LOG_HMAC_SECRET/)
      } finally {
        process.env = savedEnv
      }
    })
  })
})

