DO $$
DECLARE
  legacy_workspace_id TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "Client" WHERE "workspaceId" IS NULL
    UNION ALL SELECT 1 FROM "ComplianceItem" WHERE "workspaceId" IS NULL
    UNION ALL SELECT 1 FROM "Invoice" WHERE "workspaceId" IS NULL
    UNION ALL SELECT 1 FROM "LegalCase" WHERE "workspaceId" IS NULL
    UNION ALL SELECT 1 FROM "LegalDocument" WHERE "workspaceId" IS NULL
    UNION ALL SELECT 1 FROM "Task" WHERE "workspaceId" IS NULL
    UNION ALL SELECT 1 FROM "TimeEntry" WHERE "workspaceId" IS NULL
    UNION ALL SELECT 1 FROM "ResearchItem" WHERE "workspaceId" IS NULL
    UNION ALL SELECT 1 FROM "Course" WHERE "workspaceId" IS NULL
    UNION ALL SELECT 1 FROM "Lecture" WHERE "workspaceId" IS NULL
    UNION ALL SELECT 1 FROM "AcademicDeadline" WHERE "workspaceId" IS NULL
    UNION ALL SELECT 1 FROM "LegalTerm" WHERE "workspaceId" IS NULL
    UNION ALL SELECT 1 FROM "CaseEntry" WHERE "workspaceId" IS NULL
    UNION ALL SELECT 1 FROM "ReviewSession" WHERE "workspaceId" IS NULL
  ) THEN
    RETURN;
  END IF;

  SELECT "id" INTO legacy_workspace_id
  FROM "Workspace"
  WHERE "name" = 'Legacy Workspace'
  ORDER BY "createdAt"
  LIMIT 1;

  IF legacy_workspace_id IS NULL THEN
    INSERT INTO "Workspace" ("id", "name", "domain", "createdAt", "updatedAt")
    VALUES ('legacy_data_migration', 'Legacy Workspace', 'legacy-data-migration', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING "id" INTO legacy_workspace_id;
  END IF;

  UPDATE "Client" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
  UPDATE "ComplianceItem" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
  UPDATE "Invoice" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
  UPDATE "LegalCase" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
  UPDATE "LegalDocument" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
  UPDATE "Task" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
  UPDATE "TimeEntry" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
  UPDATE "ResearchItem" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
  UPDATE "Course" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
  UPDATE "Lecture" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
  UPDATE "AcademicDeadline" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
  UPDATE "LegalTerm" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
  UPDATE "CaseEntry" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
  UPDATE "ReviewSession" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
END $$;
