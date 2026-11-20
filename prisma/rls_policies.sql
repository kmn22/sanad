-- ============================================================================
-- Maqar (مقر) — Saudi PDPL & NCA CCC Multi-Tenant Row-Level Security (RLS)
-- and WORM Immutable Audit Log Enforcement (`prisma/rls_policies.sql`)
-- ============================================================================
-- Regulatory Alignment:
--   • Saudi Personal Data Protection Law (PDPL — Royal Decree M/19 & M/148), Art. 19
--   • NCA Cloud Cybersecurity Controls (CCC-2:2024): Tenant Isolation & Audit Logs
-- ============================================================================

-- 1. Dedicated Least-Privilege Tenant Runtime Role (`maqar_rls_tenant`)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'maqar_rls_tenant') THEN
    CREATE ROLE maqar_rls_tenant NOLOGIN NOBYPASSRLS;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO maqar_rls_tenant;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO maqar_rls_tenant;

-- 2. Session Context Helper Functions (Fail-Closed when unset)
CREATE OR REPLACE FUNCTION app_current_org_id() RETURNS text AS $$
  SELECT NULLIF(current_setting('app.current_org_id', true), '');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app_current_workspace_id() RETURNS text AS $$
  SELECT NULLIF(current_setting('app.current_workspace_id', true), '');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app_current_user_id() RETURNS text AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '');
$$ LANGUAGE sql STABLE;

-- 3. Enable Row-Level Security Across Multi-Tenant Tables
-- (`maqar_rls_tenant` has NOBYPASSRLS, enforcing strict fail-closed isolation
--  whenever `withTenantRls` executes `SET LOCAL ROLE maqar_rls_tenant`)
ALTER TABLE "Organization"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContractLifecycle"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LitigationCase"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CaseSession"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ComplianceTracker"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KnowledgeResearchItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LegalCase"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LegalDocument"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Client"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog"              ENABLE ROW LEVEL SECURITY;

-- 3. Strict Tenant Isolation Policies (Firm A can never read/mutate Firm B)
DROP POLICY IF EXISTS org_isolation_policy ON "Organization";
CREATE POLICY org_isolation_policy ON "Organization"
  USING ("id" = app_current_org_id())
  WITH CHECK ("id" = app_current_org_id());

DROP POLICY IF EXISTS workspace_isolation_policy ON "Workspace";
CREATE POLICY workspace_isolation_policy ON "Workspace"
  USING (
    "orgId" = app_current_org_id()
    OR "id" = app_current_workspace_id()
  )
  WITH CHECK (
    "orgId" = app_current_org_id()
    OR "id" = app_current_workspace_id()
  );

DROP POLICY IF EXISTS membership_isolation_policy ON "Membership";
CREATE POLICY membership_isolation_policy ON "Membership"
  USING ("orgId" = app_current_org_id() OR "userId" = app_current_user_id())
  WITH CHECK ("orgId" = app_current_org_id());

DROP POLICY IF EXISTS clm_isolation_policy ON "ContractLifecycle";
CREATE POLICY clm_isolation_policy ON "ContractLifecycle"
  USING (
    "orgId" = app_current_org_id()
    OR "workspaceId" = app_current_workspace_id()
  )
  WITH CHECK (
    "orgId" = app_current_org_id()
    OR "workspaceId" = app_current_workspace_id()
  );

DROP POLICY IF EXISTS litigation_isolation_policy ON "LitigationCase";
CREATE POLICY litigation_isolation_policy ON "LitigationCase"
  USING (
    "orgId" = app_current_org_id()
    OR "workspaceId" = app_current_workspace_id()
  )
  WITH CHECK (
    "orgId" = app_current_org_id()
    OR "workspaceId" = app_current_workspace_id()
  );

DROP POLICY IF EXISTS case_session_isolation_policy ON "CaseSession";
CREATE POLICY case_session_isolation_policy ON "CaseSession"
  USING (
    "orgId" = app_current_org_id()
    OR EXISTS (
      SELECT 1 FROM "LitigationCase" lc
      WHERE lc."id" = "CaseSession"."caseId"
        AND (
          lc."orgId" = app_current_org_id()
          OR lc."workspaceId" = app_current_workspace_id()
        )
    )
  )
  WITH CHECK (
    "orgId" = app_current_org_id()
    OR EXISTS (
      SELECT 1 FROM "LitigationCase" lc
      WHERE lc."id" = "CaseSession"."caseId"
        AND (
          lc."orgId" = app_current_org_id()
          OR lc."workspaceId" = app_current_workspace_id()
        )
    )
  );

DROP POLICY IF EXISTS compliance_isolation_policy ON "ComplianceTracker";
CREATE POLICY compliance_isolation_policy ON "ComplianceTracker"
  USING ("orgId" = app_current_org_id())
  WITH CHECK ("orgId" = app_current_org_id());

DROP POLICY IF EXISTS knowledge_visibility_policy ON "KnowledgeResearchItem";
CREATE POLICY knowledge_visibility_policy ON "KnowledgeResearchItem"
  FOR SELECT
  USING (
    "isPublic" = true
    OR ("orgId" IS NOT NULL AND "orgId" = app_current_org_id())
    OR "authorId" = app_current_user_id()
  );

DROP POLICY IF EXISTS knowledge_mutation_policy ON "KnowledgeResearchItem";
CREATE POLICY knowledge_mutation_policy ON "KnowledgeResearchItem"
  FOR ALL
  USING (
    ("orgId" IS NOT NULL AND "orgId" = app_current_org_id())
    OR "authorId" = app_current_user_id()
  )
  WITH CHECK (
    ("orgId" IS NOT NULL AND "orgId" = app_current_org_id())
    OR "authorId" = app_current_user_id()
  );

DROP POLICY IF EXISTS legal_case_workspace_isolation ON "LegalCase";
CREATE POLICY legal_case_workspace_isolation ON "LegalCase"
  USING (
    "orgId" = app_current_org_id()
    OR "workspaceId" = app_current_workspace_id()
  )
  WITH CHECK (
    "orgId" = app_current_org_id()
    OR "workspaceId" = app_current_workspace_id()
  );

DROP POLICY IF EXISTS document_workspace_isolation ON "LegalDocument";
CREATE POLICY document_workspace_isolation ON "LegalDocument"
  USING ("workspaceId" = app_current_workspace_id())
  WITH CHECK ("workspaceId" = app_current_workspace_id());

DROP POLICY IF EXISTS client_workspace_isolation ON "Client";
CREATE POLICY client_workspace_isolation ON "Client"
  USING ("workspaceId" = app_current_workspace_id())
  WITH CHECK ("workspaceId" = app_current_workspace_id());

DROP POLICY IF EXISTS invoice_workspace_isolation ON "Invoice";
CREATE POLICY invoice_workspace_isolation ON "Invoice"
  USING ("workspaceId" = app_current_workspace_id())
  WITH CHECK ("workspaceId" = app_current_workspace_id());

-- AuditLog RLS: Append-only INSERT + Tenant-Scoped SELECT (No UPDATE/DELETE)
DROP POLICY IF EXISTS audit_log_select_isolation ON "AuditLog";
CREATE POLICY audit_log_select_isolation ON "AuditLog"
  FOR SELECT
  USING ("workspaceId" = app_current_workspace_id());

DROP POLICY IF EXISTS audit_log_insert_isolation ON "AuditLog";
CREATE POLICY audit_log_insert_isolation ON "AuditLog"
  FOR INSERT
  WITH CHECK ("workspaceId" = app_current_workspace_id());

-- ============================================================================
-- 4. WORM (Write-Once-Read-Many) Immutability Triggers for Audit Trails
--    Prevents any UPDATE or DELETE on "AuditLog" & "DataAccessEvent"
-- ============================================================================
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'SECURITY_VIOLATION: AuditLog records in Maqar are immutable (NCA CCC / PDPL compliance). % operation is strictly prohibited.', TG_OP
    USING ERRCODE = '42501';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_audit_log ON "AuditLog";
CREATE TRIGGER trg_immutable_audit_log
  BEFORE UPDATE OR DELETE ON "AuditLog"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_mutation();

DROP TRIGGER IF EXISTS trg_immutable_data_access_event ON "DataAccessEvent";
CREATE TRIGGER trg_immutable_data_access_event
  BEFORE UPDATE OR DELETE ON "DataAccessEvent"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_mutation();

-- 5. High-Throughput JSONB GIN Indexes
CREATE INDEX IF NOT EXISTS idx_workspace_settings_gin ON "Workspace" USING gin ("settings" jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_membership_permissions_gin ON "Membership" USING gin ("permissions" jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_clm_metadata_gin ON "ContractLifecycle" USING gin ("metadata" jsonb_path_ops);
