ALTER TABLE "LegalCase"
  ADD COLUMN "templateId" TEXT;

ALTER TABLE "LegalDocument"
  ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'internal';

-- Preserve existing client-visible documents: anything already shared with the
-- portal (non-draft, non-received) keeps its previous behaviour.
UPDATE "LegalDocument"
SET "visibility" = 'client'
WHERE "status" NOT IN ('draft', 'received');

CREATE TABLE "WorkflowTemplate" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "caseType" TEXT,
  "stages" TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkflowTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Approval" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "caseId" TEXT,
  "documentId" TEXT,
  "taskId" TEXT,
  "title" TEXT NOT NULL,
  "details" TEXT,
  "requestedById" TEXT NOT NULL,
  "approverId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "decisionNote" TEXT,
  "decidedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentVersion" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "fileKey" TEXT NOT NULL,
  "originalName" TEXT,
  "mimeType" TEXT,
  "sizeBytes" INTEGER,
  "checksumSha256" TEXT,
  "uploadedById" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkflowTemplate_workspaceId_idx" ON "WorkflowTemplate"("workspaceId");
CREATE INDEX "WorkflowTemplate_workspaceId_active_idx" ON "WorkflowTemplate"("workspaceId", "active");
CREATE INDEX "Approval_workspaceId_idx" ON "Approval"("workspaceId");
CREATE INDEX "Approval_workspaceId_status_idx" ON "Approval"("workspaceId", "status");
CREATE INDEX "Approval_approverId_status_idx" ON "Approval"("approverId", "status");
CREATE INDEX "Approval_caseId_idx" ON "Approval"("caseId");
CREATE INDEX "Approval_documentId_idx" ON "Approval"("documentId");
CREATE UNIQUE INDEX "DocumentVersion_documentId_version_key" ON "DocumentVersion"("documentId", "version");
CREATE INDEX "DocumentVersion_workspaceId_idx" ON "DocumentVersion"("workspaceId");
CREATE INDEX "LegalCase_templateId_idx" ON "LegalCase"("templateId");
CREATE INDEX "LegalDocument_visibility_idx" ON "LegalDocument"("visibility");

ALTER TABLE "LegalCase"
  ADD CONSTRAINT "LegalCase_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorkflowTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WorkflowTemplate"
  ADD CONSTRAINT "WorkflowTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Approval"
  ADD CONSTRAINT "Approval_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Approval_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "LegalCase"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Approval_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Approval_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Approval_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentVersion"
  ADD CONSTRAINT "DocumentVersion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "DocumentVersion_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill version 1 for every document that already has stored file content
INSERT INTO "DocumentVersion" ("id", "workspaceId", "documentId", "version", "fileKey", "originalName", "mimeType", "sizeBytes", "checksumSha256", "createdAt")
SELECT 'dv_' || replace(gen_random_uuid()::text, '-', ''), d."workspaceId", d.id, 1, d."fileKey", d.title, d."mimeType", d."sizeBytes", d."checksumSha256", d."createdAt"
FROM "LegalDocument" d
WHERE d."fileKey" IS NOT NULL;
