import { afterAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Maqar DBRE Migration Consistency, Legacy Reconciliation & Drift Guardrails', () => {
  it('provisions "Legacy Migrated Practice" and reconciles all orphan workspaces, users, memberships, and cases', async () => {
    const legacyOrg = await prisma.organization.findUnique({
      where: { id: 'org-legacy-migrated-practice' },
    })
    expect(legacyOrg).not.toBeNull()
    expect(['Legacy Migrated Practice', 'المقر الرقمي للمحاماة والأعمال']).toContain(legacyOrg?.name)
    expect(legacyOrg?.slug).toBe('legacy-migrated-practice')
    expect(legacyOrg?.isActive).toBe(true)

    const nullCounts = await prisma.$queryRawUnsafe<
      Array<{
        ws_null: bigint
        user_null: bigint
        case_null: bigint
        clm_null: bigint
        lit_null: bigint
        sess_null: bigint
        orphan_users_no_membership: bigint
      }>
    >(`
      SELECT
        (SELECT COUNT(*) FROM "Workspace" WHERE "orgId" IS NULL) AS ws_null,
        (SELECT COUNT(*) FROM "User" WHERE "orgId" IS NULL) AS user_null,
        (SELECT COUNT(*) FROM "LegalCase" WHERE "orgId" IS NULL) AS case_null,
        (SELECT COUNT(*) FROM "ContractLifecycle" WHERE "orgId" IS NULL) AS clm_null,
        (SELECT COUNT(*) FROM "LitigationCase" WHERE "orgId" IS NULL) AS lit_null,
        (SELECT COUNT(*) FROM "CaseSession" WHERE "orgId" IS NULL) AS sess_null,
        (
          SELECT COUNT(*)
          FROM "User" u
          WHERE NOT EXISTS (
            SELECT 1 FROM "Membership" m WHERE m."userId" = u."id"
          )
        ) AS orphan_users_no_membership
    `)

    const row = nullCounts[0]
    expect(Number(row.ws_null)).toBe(0)
    expect(Number(row.user_null)).toBe(0)
    expect(Number(row.case_null)).toBe(0)
    expect(Number(row.clm_null)).toBe(0)
    expect(Number(row.lit_null)).toBe(0)
    expect(Number(row.sess_null)).toBe(0)
    expect(Number(row.orphan_users_no_membership)).toBe(0)
  })

  it('enforces NOT NULL, ON DELETE RESTRICT foreign keys, and B-Tree/GIN indexes in PostgreSQL catalog', async () => {
    const columns = await prisma.$queryRawUnsafe<
      Array<{ table_name: string; is_nullable: string }>
    >(`
      SELECT table_name, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND column_name = 'orgId'
        AND table_name IN ('Workspace', 'User', 'LegalCase', 'ContractLifecycle', 'LitigationCase', 'CaseSession')
      ORDER BY table_name
    `)
    expect(columns).toHaveLength(6)
    for (const col of columns) {
      expect(col.is_nullable).toBe('NO')
    }

    const restrictFks = await prisma.$queryRawUnsafe<
      Array<{ constraint_name: string; delete_rule: string }>
    >(`
      SELECT tc.constraint_name, rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name
       AND rc.constraint_schema = tc.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.constraint_name IN (
          'Workspace_orgId_fkey',
          'User_orgId_fkey',
          'LegalCase_orgId_fkey',
          'ContractLifecycle_workspaceId_fkey',
          'ContractLifecycle_orgId_fkey',
          'LitigationCase_workspaceId_fkey',
          'LitigationCase_orgId_fkey',
          'CaseSession_orgId_fkey',
          'ComplianceTracker_orgId_fkey'
        )
      ORDER BY tc.constraint_name
    `)
    expect(restrictFks).toHaveLength(9)
    for (const fk of restrictFks) {
      expect(fk.delete_rule).toBe('RESTRICT')
    }

    const indexes = await prisma.$queryRawUnsafe<Array<{ indexname: string }>>(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname IN (
          'User_orgId_idx',
          'LegalCase_orgId_stage_idx',
          'Workspace_subscriptionId_idx',
          'Approval_taskId_idx',
          'PortalFile_documentId_idx',
          'idx_membership_permissions_gin',
          'idx_workspace_settings_gin',
          'idx_clm_metadata_gin'
        )
    `)
    expect(indexes.map((i) => i.indexname).sort()).toEqual(
      [
        'Approval_taskId_idx',
        'LegalCase_orgId_stage_idx',
        'PortalFile_documentId_idx',
        'User_orgId_idx',
        'Workspace_subscriptionId_idx',
        'idx_clm_metadata_gin',
        'idx_membership_permissions_gin',
        'idx_workspace_settings_gin',
      ].sort(),
    )
  })

  it('auto-synchronizes child orgId from Workspace and blocks accidental Organization deletion via RESTRICT', async () => {
    const suffix = Date.now().toString(36)
    const testOrgId = `org-dbre-test-${suffix}`
    const testWsId = `ws-dbre-test-${suffix}`
    const testCaseId = `case-dbre-test-${suffix}`

    try {
      await prisma.organization.create({
        data: {
          id: testOrgId,
          name: 'DBRE Restriction Guard Org',
          slug: `dbre-guard-${suffix}`,
          type: 'LAW_FIRM',
          tier: 'PROFESSIONAL',
        },
      })

      const ws = await prisma.workspace.create({
        data: {
          id: testWsId,
          orgId: testOrgId,
          name: 'DBRE Guard Workspace',
          type: 'firm',
        },
      })
      expect(ws.orgId).toBe(testOrgId)

      // Create LegalCase passing ONLY workspaceId — trigger must sync orgId = testOrgId!
      const createdCase = await prisma.legalCase.create({
        data: {
          id: testCaseId,
          title: 'اختبار تزامن معرف المنظمة',
          clientName: 'موكل اختباري',
          caseType: 'litigation',
          workspaceId: testWsId,
        },
      })
      expect(createdCase.orgId).toBe(testOrgId)

      // Attempting to delete Organization while Workspace & LegalCase exist MUST fail (`ON DELETE RESTRICT`)
      await expect(
        prisma.organization.delete({ where: { id: testOrgId } }),
      ).rejects.toThrow()
    } finally {
      await prisma.legalCase.deleteMany({ where: { id: testCaseId } })
      await prisma.workspace.deleteMany({ where: { id: testWsId } })
      await prisma.organization.deleteMany({ where: { id: testOrgId } })
    }
  })
})

