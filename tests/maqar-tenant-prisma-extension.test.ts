import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'
import {
  createAsyncContextTenantPrisma,
  createTenantScopedPrisma,
  runWithTenantContext,
} from '../src/lib/security/prisma-tenant-extension'
import { TenantIsolationViolationError } from '../src/lib/security/tenant-guard'
import { validateTenantJwtClaims } from '../src/lib/security/edge-rate-limiter'
import { isPlatformSuperAdmin } from '../src/lib/auth/workspace'

const hasDb = Boolean(process.env.DATABASE_URL)
const describeWithDb = hasDb ? describe : describe.skip

describe('Maqar Multi-Tenant Security Audit — Prisma Extension, Session & Privilege Isolation', () => {
  describe('1. Session JWT Claim Validation & Super-Admin Privilege Separation', () => {
    it('enforces orgId + workspaceId + role + exp in validateTenantJwtClaims when requireOrgId is enabled', () => {
      // Missing orgId under strict middleware mode -> rejected
      expect(
        validateTenantJwtClaims(
          { id: 'u-corp', role: 'admin', workspaceId: 'ws-corp', exp: 9999999999 },
          1700000000,
          { requireOrgId: true }
        )
      ).toEqual({
        valid: false,
        reason: 'MISSING_TENANT_SCOPE',
      })

      // Blank orgId -> rejected even without options flag
      expect(
        validateTenantJwtClaims(
          { id: 'u-corp', role: 'admin', workspaceId: 'ws-corp', orgId: '   ', exp: 9999999999 },
          1700000000
        )
      ).toEqual({
        valid: false,
        reason: 'MISSING_TENANT_SCOPE',
      })

      // Complete tenant token -> valid
      expect(
        validateTenantJwtClaims(
          {
            id: 'u-corp',
            role: 'admin',
            orgId: 'org-maqar-national-tech',
            workspaceId: 'ws-maqar-national-tech-clm',
            exp: 9999999999,
          },
          1700000000,
          { requireOrgId: true }
        )
      ).toEqual({
        valid: true,
      })
    })

    it('prevents tenant admins (Corporate Legal Directors with role="admin") from escalating to Platform Super-Admin', () => {
      const previousEnv = process.env.PLATFORM_ADMIN_EMAILS
      try {
        process.env.PLATFORM_ADMIN_EMAILS = 'platform-secops@maqar.sa'

        // Corporate tenant admin with MFA enabled -> MUST NOT be treated as platform super-admin
        expect(
          isPlatformSuperAdmin({
            userId: 'user-maqar-corp-director',
            orgId: 'org-maqar-national-tech',
            workspaceId: 'ws-maqar-national-tech-clm',
            role: 'admin',
            email: 'legal.director@nationaltech.sa',
            mfaEnabled: true,
            isOwner: true,
          })
        ).toBe(false)

        // Allowlisted operator WITHOUT MFA -> denied
        expect(
          isPlatformSuperAdmin({
            userId: 'u-ops',
            orgId: 'org-ops',
            workspaceId: 'ws-ops',
            role: 'admin',
            email: 'platform-secops@maqar.sa',
            mfaEnabled: false,
          })
        ).toBe(false)

        // Allowlisted operator WITH MFA -> granted
        expect(
          isPlatformSuperAdmin({
            userId: 'u-ops',
            orgId: 'org-ops',
            workspaceId: 'ws-ops',
            role: 'admin',
            email: 'platform-secops@maqar.sa',
            mfaEnabled: true,
          })
        ).toBe(true)
      } finally {
        if (previousEnv === undefined) {
          delete process.env.PLATFORM_ADMIN_EMAILS
        } else {
          process.env.PLATFORM_ADMIN_EMAILS = previousEnv
        }
      }
    })
  })

  describeWithDb('2. Standardized Prisma Tenant Isolation Extension ($extends)', () => {
    const rawPrisma = new PrismaClient()

    const tenant1Ctx = {
      orgId: 'org-maqar-national-tech',
      workspaceId: 'ws-maqar-national-tech-clm',
      userId: 'user-maqar-corp-director',
    }

    const tenant2Ctx = {
      orgId: 'org-maqar-khaled-lawfirm',
      workspaceId: 'ws-maqar-khaled-litigation',
      userId: 'user-maqar-managing-partner',
    }

    const tdb1 = createTenantScopedPrisma(rawPrisma, tenant1Ctx)
    const tdb2 = createTenantScopedPrisma(rawPrisma, tenant2Ctx)
    const asyncTdb = createAsyncContextTenantPrisma(rawPrisma)

    const createdCaseIds: string[] = []

    beforeAll(async () => {
      // Ensure seeded tenants exist
      const org1 = await rawPrisma.organization.findUnique({
        where: { id: tenant1Ctx.orgId },
      })
      expect(org1).not.toBeNull()
    })

    afterAll(async () => {
      if (createdCaseIds.length > 0) {
        await rawPrisma.legalCase.deleteMany({
          where: { id: { in: createdCaseIds } },
        })
      }
      await rawPrisma.$disconnect()
    })

    it('auto-injects orgId + workspaceId into findMany, findFirst, and count — even with top-level OR clauses', async () => {
      // Unfiltered findMany() on Tenant 1 returns ONLY Tenant 1 contracts
      const t1Contracts = await tdb1.contractLifecycle.findMany({
        where: {
          OR: [{ status: 'ACTIVE' }, { status: 'LEGAL_REVIEW' }],
        },
      })
      expect(t1Contracts.length).toBeGreaterThanOrEqual(2)
      expect(t1Contracts.every((c) => c.orgId === tenant1Ctx.orgId)).toBe(true)

      // Unfiltered findMany() on Tenant 2 returns ZERO of Tenant 1's contracts
      const t2Contracts = await tdb2.contractLifecycle.findMany({
        where: {
          OR: [{ status: 'ACTIVE' }, { status: 'LEGAL_REVIEW' }],
        },
      })
      expect(t2Contracts).toHaveLength(0)

      // Tenant 2 sees its own litigation cases & sessions; Tenant 1 sees 0 of them
      const t2LitCases = await tdb2.litigationCase.findMany()
      const t1LitCases = await tdb1.litigationCase.findMany()
      expect(t2LitCases.length).toBeGreaterThanOrEqual(2)
      expect(t1LitCases).toHaveLength(0)

      const t2SessionsCount = await tdb2.caseSession.count()
      const t1SessionsCount = await tdb1.caseSession.count()
      expect(t2SessionsCount).toBeGreaterThanOrEqual(2)
      expect(t1SessionsCount).toBe(0)
    })

    it('blocks IDOR on findUnique and findUniqueOrThrow when supplying another tenant ID', async () => {
      // Tenant 1 owns 'clm-national-tech-nda-01'
      const ownLookup = await tdb1.contractLifecycle.findUnique({
        where: { id: 'clm-national-tech-nda-01' },
      })
      expect(ownLookup?.id).toBe('clm-national-tech-nda-01')

      // Tenant 2 attempting IDOR via findUnique gets null (zero data leaked)
      const crossLookup = await tdb2.contractLifecycle.findUnique({
        where: { id: 'clm-national-tech-nda-01' },
      })
      expect(crossLookup).toBeNull()

      // Tenant 2 attempting IDOR via findUniqueOrThrow throws TenantIsolationViolationError
      await expect(
        tdb2.contractLifecycle.findUniqueOrThrow({
          where: { id: 'clm-national-tech-nda-01' },
        })
      ).rejects.toThrow(TenantIsolationViolationError)
    })

    it('blocks cross-tenant update({ where: { id } }) and delete({ where: { id } }) IDOR mutations', async () => {
      // Tenant 2 tries to mutate Tenant 1's NDA contract by primary key
      await expect(
        tdb2.contractLifecycle.update({
          where: { id: 'clm-national-tech-nda-01' },
          data: { title: 'COMPROMISED_BY_TENANT_2' },
        })
      ).rejects.toThrow(TenantIsolationViolationError)

      const intactContract = await rawPrisma.contractLifecycle.findUnique({
        where: { id: 'clm-national-tech-nda-01' },
      })
      expect(intactContract?.title).not.toBe('COMPROMISED_BY_TENANT_2')

      // Tenant 1 tries to delete Tenant 2's court session by primary key
      const t2Session = await tdb2.caseSession.findFirst()
      expect(t2Session).not.toBeNull()

      await expect(
        tdb1.caseSession.delete({
          where: { id: t2Session!.id },
        })
      ).rejects.toThrow(TenantIsolationViolationError)
    })

    it('auto-stamps orgId & workspaceId on create and rejects spoofed foreign tenant IDs or cross-tenant upserts', async () => {
      // Auto-stamps orgId and workspaceId when omitted from create payload
      const created = await (tdb1.legalCase.create as (args: unknown) => Promise<{ id: string; orgId: string; workspaceId: string }>)({
        data: {
          title: 'قضية اختبار العزل التلقائي',
          clientName: 'الشركة الوطنية للتقنية',
          caseType: 'contract',
        },
      })
      createdCaseIds.push(created.id)
      expect(created.orgId).toBe(tenant1Ctx.orgId)
      expect(created.workspaceId).toBe(tenant1Ctx.workspaceId)

      // Rejects create payload attempting to inject Tenant 2's orgId
      await expect(
        tdb1.legalCase.create({
          data: {
            title: 'محاولة تزوير معرف المنشأة',
            clientName: 'Test',
            caseType: 'litigation',
            orgId: tenant2Ctx.orgId,
            workspaceId: tenant1Ctx.workspaceId,
          },
        })
      ).rejects.toThrow(TenantIsolationViolationError)

      // Rejects upsert colliding with Tenant 1's existing record ID from Tenant 2
      await expect(
        tdb2.legalCase.upsert({
          where: { id: created.id },
          create: {
            id: created.id,
            title: 'Upsert Create',
            clientName: 'Firm 2',
            caseType: 'litigation',
            orgId: tenant2Ctx.orgId,
            workspaceId: tenant2Ctx.workspaceId,
          },
          update: { title: 'OVERWRITTEN_VIA_UPSERT' },
        })
      ).rejects.toThrow(TenantIsolationViolationError)
    })

    it('blocks cross-tenant cursor pagination oracle attacks on findMany', async () => {
      await expect(
        tdb2.contractLifecycle.findMany({
          take: 5,
          skip: 1,
          cursor: { id: 'clm-national-tech-nda-01' },
        })
      ).rejects.toThrow(TenantIsolationViolationError)
    })

    it('enforces AsyncLocalStorage tenant context via runWithTenantContext and fails closed when uninitialized', async () => {
      await expect(asyncTdb.contractLifecycle.findMany()).rejects.toThrow(
        TenantIsolationViolationError
      )

      const scopedContracts = await runWithTenantContext(tenant1Ctx, () =>
        asyncTdb.contractLifecycle.findMany()
      )
      expect(scopedContracts.length).toBeGreaterThanOrEqual(2)
      expect(scopedContracts.every((c) => c.orgId === tenant1Ctx.orgId)).toBe(true)
    })
  })
})

