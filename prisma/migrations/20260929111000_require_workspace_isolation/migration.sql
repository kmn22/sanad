ALTER TABLE "Communication" ADD COLUMN "workspaceId" TEXT;

UPDATE "Communication" c
SET "workspaceId" = lc."workspaceId"
FROM "LegalCase" lc
WHERE c."caseId" = lc."id";

UPDATE "Communication" c
SET "workspaceId" = cl."workspaceId"
FROM "Client" cl
WHERE c."workspaceId" IS NULL
  AND c."clientId" = cl."id";

DO $$
DECLARE
  legacy_workspace_id TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM "Communication" WHERE "workspaceId" IS NULL) THEN
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

    UPDATE "Communication" SET "workspaceId" = legacy_workspace_id WHERE "workspaceId" IS NULL;
  END IF;
END $$;

ALTER TABLE "Communication" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Communication_workspaceId_idx" ON "Communication"("workspaceId");

ALTER TABLE "Client" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "ComplianceItem" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "LegalCase" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "LegalDocument" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "Task" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "TimeEntry" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "ResearchItem" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "Course" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "Lecture" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "AcademicDeadline" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "LegalTerm" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "CaseEntry" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "ReviewSession" ALTER COLUMN "workspaceId" SET NOT NULL;
