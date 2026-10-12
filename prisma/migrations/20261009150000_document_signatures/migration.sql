CREATE TABLE "DocumentSignature" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "documentId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentSignature_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DocumentSignature_signature_key" ON "DocumentSignature"("signature");
CREATE INDEX "DocumentSignature_workspaceId_createdAt_idx" ON "DocumentSignature"("workspaceId", "createdAt");
CREATE INDEX "DocumentSignature_userId_createdAt_idx" ON "DocumentSignature"("userId", "createdAt");
CREATE INDEX "DocumentSignature_documentId_createdAt_idx" ON "DocumentSignature"("documentId", "createdAt");

ALTER TABLE "DocumentSignature" ADD CONSTRAINT "DocumentSignature_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentSignature" ADD CONSTRAINT "DocumentSignature_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
