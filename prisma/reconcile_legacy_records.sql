-- ============================================================================
-- Maqar (مقر) — Idempotent Legacy Data Reconciliation & Multi-Tenant Hardening
-- File: prisma/reconcile_legacy_records.sql
-- Role: Database Reliability Engineering (DBRE) Production Patch
-- ============================================================================
-- Safe to execute multiple times (100% idempotent).
-- Resolves orphan single-tenant ("Sanad") workspaces, users, legal cases,
-- contracts, litigation dockets, and hearings prior to enforcing strict
-- `orgId NOT NULL` + `ON DELETE RESTRICT` multi-tenant constraints.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PHASE 1: Provision Default Fallback Organization & Expand Nullable Columns
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_conflict_slug_id TEXT;
BEGIN
  SELECT "id" INTO v_conflict_slug_id
  FROM "Organization"
  WHERE "slug" = 'legacy-migrated-practice'
    AND "id" <> 'org-legacy-migrated-practice'
  LIMIT 1;

  IF v_conflict_slug_id IS NOT NULL THEN
    UPDATE "Organization"
    SET "slug" = 'legacy-migrated-practice-' || substr(v_conflict_slug_id, 1, 8),
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = v_conflict_slug_id;
  END IF;

  INSERT INTO "Organization" (
    "id",
    "name",
    "slug",
    "type",
    "tier",
    "isActive",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    'org-legacy-migrated-practice',
    'Legacy Migrated Practice',
    'legacy-migrated-practice',
    'LAW_FIRM',
    'PROFESSIONAL',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT ("id") DO UPDATE
    SET "isActive" = true,
        "updatedAt" = CURRENT_TIMESTAMP;
END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "orgId" TEXT;
ALTER TABLE "LegalCase" ADD COLUMN IF NOT EXISTS "orgId" TEXT;

-- ----------------------------------------------------------------------------
-- PHASE 2: Reconcile Orphan Workspaces, Users, Memberships, Cases & Contracts
-- ----------------------------------------------------------------------------

-- 2.1 Attach any unassigned or dangling legacy Workspaces to Default Organization
UPDATE "Workspace" w
SET "orgId" = 'org-legacy-migrated-practice',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE w."orgId" IS NULL
   OR NOT EXISTS (
     SELECT 1 FROM "Organization" o WHERE o."id" = w."orgId"
   );

-- 2.2 Reconcile orphan Users with `workspaceId IS NULL` (excluding external client portal logins)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "User" u
    WHERE u."workspaceId" IS NULL
      AND COALESCE(u."role", 'lawyer') <> 'client'
  ) THEN
    INSERT INTO "Workspace" (
      "id",
      "orgId",
      "name",
      "type",
      "settings",
      "status",
      "onboardingStatus",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      'ws-legacy-migrated-practice',
      'org-legacy-migrated-practice',
      'Legacy Migrated Practice — مساحة العمل المرحّلة',
      'firm',
      '{"migratedFromLegacySingleTenant": true}'::jsonb,
      'active',
      'completed',
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT ("id") DO UPDATE
      SET "orgId" = COALESCE("Workspace"."orgId", 'org-legacy-migrated-practice'),
          "updatedAt" = CURRENT_TIMESTAMP;

    UPDATE "User" u
    SET "workspaceId" = 'ws-legacy-migrated-practice',
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE u."workspaceId" IS NULL
      AND COALESCE(u."role", 'lawyer') <> 'client';
  END IF;
END $$;

-- 2.3 Backfill `User.orgId` from parent Workspace -> active Membership -> Default Organization
UPDATE "User" u
SET "orgId" = w."orgId"
FROM "Workspace" w
WHERE u."workspaceId" = w."id"
  AND (u."orgId" IS NULL OR u."orgId" = 'org-legacy-migrated-practice')
  AND w."orgId" IS NOT NULL;

UPDATE "User" u
SET "orgId" = m."orgId"
FROM "Membership" m
WHERE u."id" = m."userId"
  AND m."isActive" = true
  AND u."orgId" IS NULL;

UPDATE "User" u
SET "orgId" = 'org-legacy-migrated-practice'
WHERE u."orgId" IS NULL
   OR NOT EXISTS (
     SELECT 1 FROM "Organization" o WHERE o."id" = u."orgId"
   );

-- 2.4 Backfill Organization `Membership` & `WorkspaceMembership` for legacy users
INSERT INTO "Membership" (
  "id",
  "userId",
  "orgId",
  "role",
  "permissions",
  "isActive",
  "joinedAt",
  "createdAt",
  "updatedAt"
)
SELECT
  'mbr-legacy-' || substr(md5(u."id" || ':' || u."orgId"), 1, 20),
  u."id",
  u."orgId",
  CASE u."role"
    WHEN 'admin' THEN 'SUPER_ADMIN'::"MembershipRole"
    WHEN 'workspace_owner' THEN 'MANAGING_PARTNER'::"MembershipRole"
    WHEN 'student' THEN 'TRAINEE_STUDENT'::"MembershipRole"
    WHEN 'auditor' THEN 'COMPLIANCE_LEAD'::"MembershipRole"
    WHEN 'client' THEN 'VIEWER_CLIENT'::"MembershipRole"
    ELSE 'ASSOCIATE'::"MembershipRole"
  END,
  '{"reconciledFromLegacy": true}'::jsonb,
  true,
  u."createdAt",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1
  FROM "Membership" m
  WHERE m."userId" = u."id"
    AND m."orgId" = u."orgId"
)
ON CONFLICT ("userId", "orgId") DO NOTHING;

INSERT INTO "WorkspaceMembership" (
  "id",
  "workspaceId",
  "userId",
  "role",
  "status",
  "isOwner",
  "joinedAt",
  "createdAt",
  "updatedAt"
)
SELECT
  'wsm-legacy-' || substr(md5(u."workspaceId" || ':' || u."id"), 1, 20),
  u."workspaceId",
  u."id",
  COALESCE(u."role", 'lawyer'),
  'active',
  (u."role" IN ('admin', 'workspace_owner')),
  u."createdAt",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User" u
WHERE u."workspaceId" IS NOT NULL
  AND COALESCE(u."role", 'lawyer') <> 'client'
  AND NOT EXISTS (
    SELECT 1
    FROM "WorkspaceMembership" wm
    WHERE wm."workspaceId" = u."workspaceId"
      AND wm."userId" = u."id"
  )
ON CONFLICT ("workspaceId", "userId") DO NOTHING;

-- 2.5 Backfill `LegalCase.orgId` from parent Workspace -> Default Organization
UPDATE "LegalCase" lc
SET "orgId" = w."orgId"
FROM "Workspace" w
WHERE lc."workspaceId" = w."id"
  AND (lc."orgId" IS NULL OR lc."orgId" <> w."orgId");

UPDATE "LegalCase" lc
SET "orgId" = 'org-legacy-migrated-practice'
WHERE lc."orgId" IS NULL
   OR NOT EXISTS (
     SELECT 1 FROM "Organization" o WHERE o."id" = lc."orgId"
   );

-- 2.6 Backfill `ContractLifecycle.orgId`, `LitigationCase.orgId`, and `CaseSession.orgId`
UPDATE "ContractLifecycle" clm
SET "orgId" = w."orgId"
FROM "Workspace" w
WHERE clm."workspaceId" = w."id"
  AND (clm."orgId" IS NULL OR clm."orgId" <> w."orgId");

UPDATE "ContractLifecycle" clm
SET "orgId" = 'org-legacy-migrated-practice'
WHERE clm."orgId" IS NULL
   OR NOT EXISTS (
     SELECT 1 FROM "Organization" o WHERE o."id" = clm."orgId"
   );

UPDATE "LitigationCase" lit
SET "orgId" = w."orgId"
FROM "Workspace" w
WHERE lit."workspaceId" = w."id"
  AND (lit."orgId" IS NULL OR lit."orgId" <> w."orgId");

UPDATE "LitigationCase" lit
SET "orgId" = 'org-legacy-migrated-practice'
WHERE lit."orgId" IS NULL
   OR NOT EXISTS (
     SELECT 1 FROM "Organization" o WHERE o."id" = lit."orgId"
   );

UPDATE "CaseSession" cs
SET "orgId" = lit."orgId"
FROM "LitigationCase" lit
WHERE cs."caseId" = lit."id"
  AND (cs."orgId" IS NULL OR cs."orgId" <> lit."orgId");

UPDATE "CaseSession" cs
SET "orgId" = 'org-legacy-migrated-practice'
WHERE cs."orgId" IS NULL
   OR NOT EXISTS (
     SELECT 1 FROM "Organization" o WHERE o."id" = cs."orgId"
   );

-- ----------------------------------------------------------------------------
-- PHASE 3: Pre-Constraint Verification Gate (Abort Safely if Any Null Remains)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_null_workspaces  BIGINT;
  v_null_users       BIGINT;
  v_null_legal_cases BIGINT;
  v_null_clm         BIGINT;
  v_null_litigation  BIGINT;
  v_null_sessions    BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_null_workspaces  FROM "Workspace"         WHERE "orgId" IS NULL;
  SELECT COUNT(*) INTO v_null_users       FROM "User"              WHERE "orgId" IS NULL;
  SELECT COUNT(*) INTO v_null_legal_cases FROM "LegalCase"         WHERE "orgId" IS NULL;
  SELECT COUNT(*) INTO v_null_clm         FROM "ContractLifecycle" WHERE "orgId" IS NULL;
  SELECT COUNT(*) INTO v_null_litigation  FROM "LitigationCase"    WHERE "orgId" IS NULL;
  SELECT COUNT(*) INTO v_null_sessions    FROM "CaseSession"       WHERE "orgId" IS NULL;

  IF (v_null_workspaces + v_null_users + v_null_legal_cases + v_null_clm + v_null_litigation + v_null_sessions) > 0 THEN
    RAISE EXCEPTION
      'DBRE Pre-Constraint Gate Failed: Remaining NULL orgId counts -> Workspace=%, User=%, LegalCase=%, CLM=%, LitigationCase=%, CaseSession=%',
      v_null_workspaces, v_null_users, v_null_legal_cases, v_null_clm, v_null_litigation, v_null_sessions;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- PHASE 4: Contract (`SET DEFAULT`, `SET NOT NULL`, Indexes, `RESTRICT` FKs)
-- ----------------------------------------------------------------------------
ALTER TABLE "Workspace"
  ALTER COLUMN "orgId" SET DEFAULT 'org-legacy-migrated-practice',
  ALTER COLUMN "orgId" SET NOT NULL;

ALTER TABLE "User"
  ALTER COLUMN "orgId" SET DEFAULT 'org-legacy-migrated-practice',
  ALTER COLUMN "orgId" SET NOT NULL;

ALTER TABLE "LegalCase"
  ALTER COLUMN "orgId" SET DEFAULT 'org-legacy-migrated-practice',
  ALTER COLUMN "orgId" SET NOT NULL;

ALTER TABLE "ContractLifecycle"
  ALTER COLUMN "orgId" SET DEFAULT 'org-legacy-migrated-practice',
  ALTER COLUMN "orgId" SET NOT NULL;

ALTER TABLE "LitigationCase"
  ALTER COLUMN "orgId" SET DEFAULT 'org-legacy-migrated-practice',
  ALTER COLUMN "orgId" SET NOT NULL;

ALTER TABLE "CaseSession"
  ALTER COLUMN "orgId" SET DEFAULT 'org-legacy-migrated-practice',
  ALTER COLUMN "orgId" SET NOT NULL;

-- Create missing B-Tree & JSONB GIN indexes (100% idempotent)
CREATE INDEX IF NOT EXISTS "Approval_taskId_idx" ON "Approval"("taskId");
CREATE INDEX IF NOT EXISTS "LegalCase_orgId_stage_idx" ON "LegalCase"("orgId", "stage");
CREATE INDEX IF NOT EXISTS "PortalFile_documentId_idx" ON "PortalFile"("documentId");
CREATE INDEX IF NOT EXISTS "User_orgId_idx" ON "User"("orgId");
CREATE INDEX IF NOT EXISTS "Workspace_subscriptionId_idx" ON "Workspace"("subscriptionId");

CREATE INDEX IF NOT EXISTS "idx_membership_permissions_gin"
  ON "Membership" USING GIN ("permissions" jsonb_path_ops);
CREATE INDEX IF NOT EXISTS "idx_workspace_settings_gin"
  ON "Workspace" USING GIN ("settings" jsonb_path_ops);
CREATE INDEX IF NOT EXISTS "idx_clm_metadata_gin"
  ON "ContractLifecycle" USING GIN ("metadata" jsonb_path_ops);

-- Reconcile missing baseline FKs & enforce `ON DELETE RESTRICT` on tenant boundaries
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LegalDocument_caseId_fkey') THEN
    ALTER TABLE "LegalDocument"
      ADD CONSTRAINT "LegalDocument_caseId_fkey"
      FOREIGN KEY ("caseId") REFERENCES "LegalCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Task_caseId_fkey') THEN
    ALTER TABLE "Task"
      ADD CONSTRAINT "Task_caseId_fkey"
      FOREIGN KEY ("caseId") REFERENCES "LegalCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "Workspace" DROP CONSTRAINT IF EXISTS "Workspace_orgId_fkey";
ALTER TABLE "Workspace"
  ADD CONSTRAINT "Workspace_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_orgId_fkey";
ALTER TABLE "User"
  ADD CONSTRAINT "User_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LegalCase" DROP CONSTRAINT IF EXISTS "LegalCase_orgId_fkey";
ALTER TABLE "LegalCase"
  ADD CONSTRAINT "LegalCase_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ContractLifecycle" DROP CONSTRAINT IF EXISTS "ContractLifecycle_workspaceId_fkey";
ALTER TABLE "ContractLifecycle"
  ADD CONSTRAINT "ContractLifecycle_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ContractLifecycle" DROP CONSTRAINT IF EXISTS "ContractLifecycle_orgId_fkey";
ALTER TABLE "ContractLifecycle"
  ADD CONSTRAINT "ContractLifecycle_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LitigationCase" DROP CONSTRAINT IF EXISTS "LitigationCase_workspaceId_fkey";
ALTER TABLE "LitigationCase"
  ADD CONSTRAINT "LitigationCase_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LitigationCase" DROP CONSTRAINT IF EXISTS "LitigationCase_orgId_fkey";
ALTER TABLE "LitigationCase"
  ADD CONSTRAINT "LitigationCase_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CaseSession" DROP CONSTRAINT IF EXISTS "CaseSession_orgId_fkey";
ALTER TABLE "CaseSession"
  ADD CONSTRAINT "CaseSession_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ComplianceTracker" DROP CONSTRAINT IF EXISTS "ComplianceTracker_orgId_fkey";
ALTER TABLE "ComplianceTracker"
  ADD CONSTRAINT "ComplianceTracker_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------------------------------------------------------
-- PHASE 5: Automatic Tenant `orgId` Synchronization Triggers
-- Ensures legacy callers omitting `orgId` inherit their parent Workspace/Case
-- `orgId`, and guarantees `'org-legacy-migrated-practice'` exists if referenced.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_ensure_legacy_default_org()
RETURNS void AS $$
BEGIN
  INSERT INTO "Organization" (
    "id", "name", "slug", "type", "tier", "isActive", "createdAt", "updatedAt"
  )
  VALUES (
    'org-legacy-migrated-practice',
    'Legacy Migrated Practice',
    'legacy-migrated-practice',
    'LAW_FIRM',
    'PROFESSIONAL',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT ("id") DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_sync_workspace_org_id()
RETURNS trigger AS $$
BEGIN
  IF NEW."orgId" IS NULL OR NEW."orgId" = 'org-legacy-migrated-practice' THEN
    PERFORM fn_ensure_legacy_default_org();
    NEW."orgId" := 'org-legacy-migrated-practice';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_sync_workspace_child_org_id()
RETURNS trigger AS $$
DECLARE
  v_ws_org_id TEXT;
BEGIN
  IF NEW."workspaceId" IS NOT NULL THEN
    SELECT w."orgId" INTO v_ws_org_id
    FROM "Workspace" w
    WHERE w."id" = NEW."workspaceId";

    IF v_ws_org_id IS NOT NULL AND (NEW."orgId" IS NULL OR NEW."orgId" = 'org-legacy-migrated-practice') THEN
      NEW."orgId" := v_ws_org_id;
    END IF;
  END IF;

  IF NEW."orgId" IS NULL OR NEW."orgId" = 'org-legacy-migrated-practice' THEN
    PERFORM fn_ensure_legacy_default_org();
    NEW."orgId" := 'org-legacy-migrated-practice';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_sync_case_session_org_id()
RETURNS trigger AS $$
DECLARE
  v_case_org_id TEXT;
BEGIN
  IF NEW."caseId" IS NOT NULL THEN
    SELECT lc."orgId" INTO v_case_org_id
    FROM "LitigationCase" lc
    WHERE lc."id" = NEW."caseId";

    IF v_case_org_id IS NOT NULL AND (NEW."orgId" IS NULL OR NEW."orgId" = 'org-legacy-migrated-practice') THEN
      NEW."orgId" := v_case_org_id;
    END IF;
  END IF;

  IF NEW."orgId" IS NULL OR NEW."orgId" = 'org-legacy-migrated-practice' THEN
    PERFORM fn_ensure_legacy_default_org();
    NEW."orgId" := 'org-legacy-migrated-practice';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_propagate_workspace_org_change()
RETURNS trigger AS $$
BEGIN
  IF NEW."orgId" IS DISTINCT FROM OLD."orgId" THEN
    UPDATE "User"              SET "orgId" = NEW."orgId" WHERE "workspaceId" = NEW."id";
    UPDATE "LegalCase"         SET "orgId" = NEW."orgId" WHERE "workspaceId" = NEW."id";
    UPDATE "ContractLifecycle" SET "orgId" = NEW."orgId" WHERE "workspaceId" = NEW."id";
    UPDATE "LitigationCase"    SET "orgId" = NEW."orgId" WHERE "workspaceId" = NEW."id";
    UPDATE "CaseSession" cs
    SET "orgId" = NEW."orgId"
    FROM "LitigationCase" lc
    WHERE cs."caseId" = lc."id"
      AND lc."workspaceId" = NEW."id";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_workspace_org_id ON "Workspace";
CREATE TRIGGER trg_sync_workspace_org_id
  BEFORE INSERT OR UPDATE ON "Workspace"
  FOR EACH ROW EXECUTE FUNCTION fn_sync_workspace_org_id();

DROP TRIGGER IF EXISTS trg_propagate_workspace_org_change ON "Workspace";
CREATE TRIGGER trg_propagate_workspace_org_change
  AFTER UPDATE OF "orgId" ON "Workspace"
  FOR EACH ROW EXECUTE FUNCTION fn_propagate_workspace_org_change();

DROP TRIGGER IF EXISTS trg_sync_user_org_id ON "User";
CREATE TRIGGER trg_sync_user_org_id
  BEFORE INSERT OR UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION fn_sync_workspace_child_org_id();

DROP TRIGGER IF EXISTS trg_sync_legal_case_org_id ON "LegalCase";
CREATE TRIGGER trg_sync_legal_case_org_id
  BEFORE INSERT OR UPDATE ON "LegalCase"
  FOR EACH ROW EXECUTE FUNCTION fn_sync_workspace_child_org_id();

DROP TRIGGER IF EXISTS trg_sync_clm_org_id ON "ContractLifecycle";
CREATE TRIGGER trg_sync_clm_org_id
  BEFORE INSERT OR UPDATE ON "ContractLifecycle"
  FOR EACH ROW EXECUTE FUNCTION fn_sync_workspace_child_org_id();

DROP TRIGGER IF EXISTS trg_sync_litigation_org_id ON "LitigationCase";
CREATE TRIGGER trg_sync_litigation_org_id
  BEFORE INSERT OR UPDATE ON "LitigationCase"
  FOR EACH ROW EXECUTE FUNCTION fn_sync_workspace_child_org_id();

DROP TRIGGER IF EXISTS trg_sync_case_session_org_id ON "CaseSession";
CREATE TRIGGER trg_sync_case_session_org_id
  BEFORE INSERT OR UPDATE ON "CaseSession"
  FOR EACH ROW EXECUTE FUNCTION fn_sync_case_session_org_id();

