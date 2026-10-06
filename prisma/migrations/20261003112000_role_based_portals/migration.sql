-- Role-based portals: client logins, account type, workspace type.

ALTER TABLE "User"
  ADD COLUMN "clientId" TEXT,
  ADD COLUMN "accountType" TEXT;

ALTER TABLE "User"
  ADD CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "User_clientId_idx" ON "User"("clientId");

ALTER TABLE "Workspace" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'firm';

ALTER TABLE "Invitation" ADD COLUMN "clientId" TEXT;
