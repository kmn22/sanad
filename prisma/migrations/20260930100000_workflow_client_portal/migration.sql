CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE "Notification"
  ADD COLUMN "workspaceId" TEXT,
  ADD COLUMN "actorId" TEXT,
  ADD COLUMN "type" TEXT NOT NULL DEFAULT 'system',
  ADD COLUMN "entityType" TEXT,
  ADD COLUMN "entityId" TEXT;

UPDATE "Notification" n
SET "workspaceId" = u."workspaceId"
FROM "User" u
WHERE u.id = n."userId";

DELETE FROM "Notification" n
WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = n."userId")
   OR n."workspaceId" IS NULL;

ALTER TABLE "Notification"
  ALTER COLUMN "workspaceId" SET NOT NULL,
  ADD CONSTRAINT "Notification_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Notification_workspaceId_idx" ON "Notification"("workspaceId");
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

ALTER TABLE "Task" ADD COLUMN "assignedToId" TEXT;
ALTER TABLE "Task"
  ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");

CREATE TABLE "CaseAssignment" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "assignedById" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'assignee',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CaseAssignment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CaseAssignment_caseId_userId_key" ON "CaseAssignment"("caseId", "userId");
CREATE INDEX "CaseAssignment_workspaceId_idx" ON "CaseAssignment"("workspaceId");
CREATE INDEX "CaseAssignment_userId_idx" ON "CaseAssignment"("userId");
ALTER TABLE "CaseAssignment"
  ADD CONSTRAINT "CaseAssignment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "CaseAssignment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "LegalCase"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "CaseAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "WorkflowEvent" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "caseId" TEXT,
  "taskId" TEXT,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "fromState" TEXT,
  "toState" TEXT,
  "note" TEXT,
  "metadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkflowEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "WorkflowEvent_workspaceId_idx" ON "WorkflowEvent"("workspaceId");
CREATE INDEX "WorkflowEvent_caseId_idx" ON "WorkflowEvent"("caseId");
CREATE INDEX "WorkflowEvent_taskId_idx" ON "WorkflowEvent"("taskId");
CREATE INDEX "WorkflowEvent_createdAt_idx" ON "WorkflowEvent"("createdAt");
ALTER TABLE "WorkflowEvent"
  ADD CONSTRAINT "WorkflowEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "WorkflowEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "LegalCase"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "WorkflowEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "WorkflowEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "PortalAccess" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "caseId" TEXT,
  "tokenHash" TEXT NOT NULL,
  "label" TEXT,
  "allowUpload" BOOLEAN NOT NULL DEFAULT true,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "lastAccessedAt" TIMESTAMP(3),
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PortalAccess_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PortalAccess_tokenHash_key" ON "PortalAccess"("tokenHash");
CREATE INDEX "PortalAccess_workspaceId_idx" ON "PortalAccess"("workspaceId");
CREATE INDEX "PortalAccess_clientId_idx" ON "PortalAccess"("clientId");
CREATE INDEX "PortalAccess_caseId_idx" ON "PortalAccess"("caseId");
CREATE INDEX "PortalAccess_expiresAt_idx" ON "PortalAccess"("expiresAt");
ALTER TABLE "PortalAccess"
  ADD CONSTRAINT "PortalAccess_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "PortalAccess_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "PortalAccess_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "LegalCase"(id) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PortalRequest" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "portalAccessId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "caseId" TEXT,
  "assignedToId" TEXT,
  "createdBy" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "priority" TEXT NOT NULL DEFAULT 'normal',
  "dueDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PortalRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PortalRequest_workspaceId_idx" ON "PortalRequest"("workspaceId");
CREATE INDEX "PortalRequest_portalAccessId_idx" ON "PortalRequest"("portalAccessId");
CREATE INDEX "PortalRequest_clientId_idx" ON "PortalRequest"("clientId");
CREATE INDEX "PortalRequest_caseId_idx" ON "PortalRequest"("caseId");
CREATE INDEX "PortalRequest_status_idx" ON "PortalRequest"("status");
ALTER TABLE "PortalRequest"
  ADD CONSTRAINT "PortalRequest_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "PortalRequest_portalAccessId_fkey" FOREIGN KEY ("portalAccessId") REFERENCES "PortalAccess"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "PortalRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "PortalRequest_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "LegalCase"(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "PortalRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LegalDocument"
  ADD COLUMN "fileKey" TEXT,
  ADD COLUMN "mimeType" TEXT,
  ADD COLUMN "sizeBytes" INTEGER,
  ADD COLUMN "checksumSha256" TEXT,
  ADD COLUMN "uploadedBy" TEXT;

CREATE TABLE "PortalFile" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "portalAccessId" TEXT NOT NULL,
  "requestId" TEXT,
  "documentId" TEXT,
  "clientId" TEXT NOT NULL,
  "caseId" TEXT,
  "fileKey" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "checksumSha256" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'stored',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PortalFile_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PortalFile_workspaceId_idx" ON "PortalFile"("workspaceId");
CREATE INDEX "PortalFile_portalAccessId_idx" ON "PortalFile"("portalAccessId");
CREATE INDEX "PortalFile_requestId_idx" ON "PortalFile"("requestId");
CREATE INDEX "PortalFile_clientId_idx" ON "PortalFile"("clientId");
CREATE INDEX "PortalFile_caseId_idx" ON "PortalFile"("caseId");
ALTER TABLE "PortalFile"
  ADD CONSTRAINT "PortalFile_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "PortalFile_portalAccessId_fkey" FOREIGN KEY ("portalAccessId") REFERENCES "PortalAccess"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "PortalFile_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PortalRequest"(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "PortalFile_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "LegalDocument"(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "PortalFile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "PortalFile_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "LegalCase"(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Preserve existing portal URLs by migrating their raw token into a hashed,
-- expiring access grant. Create a fallback client only for legacy case-only links.
INSERT INTO "Client" ("id", "name", "type", "workspaceId", "createdAt", "updatedAt")
SELECT 'legacy-' || c.id, c."clientName", 'individual', c."workspaceId", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "LegalCase" c
WHERE c."portalToken" IS NOT NULL
  AND c."clientId" IS NULL
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "PortalAccess" (
  "id", "workspaceId", "clientId", "caseId", "tokenHash",
  "label", "expiresAt", "createdAt", "updatedAt"
)
SELECT
  'legacy-' || c.id,
  c."workspaceId",
  COALESCE(c."clientId", 'legacy-' || c.id),
  c.id,
  encode(digest(c."portalToken", 'sha256'), 'hex'),
  'Migrated case portal link',
  CURRENT_TIMESTAMP + INTERVAL '30 days',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "LegalCase" c
WHERE c."portalToken" IS NOT NULL
ON CONFLICT ("tokenHash") DO NOTHING;

ALTER TABLE "LegalCase" DROP COLUMN "portalToken";
