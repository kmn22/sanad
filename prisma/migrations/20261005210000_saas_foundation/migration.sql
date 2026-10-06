ALTER TABLE "Workspace"
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN "onboardingStatus" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN "ownerId" TEXT,
  ADD COLUMN "suspendedAt" TIMESTAMP(3),
  ADD COLUMN "suspensionReason" TEXT;

UPDATE "Workspace" w
SET "ownerId" = (
      SELECT u.id
      FROM "User" u
      WHERE u."workspaceId" = w.id AND u.role IN ('workspace_owner', 'admin')
      ORDER BY CASE WHEN u.role = 'workspace_owner' THEN 0 ELSE 1 END, u."createdAt"
      LIMIT 1
    ),
    "onboardingStatus" = 'completed';

CREATE TABLE "WorkspaceMembership" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "isOwner" BOOLEAN NOT NULL DEFAULT false,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "suspendedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkspaceMembership_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WorkspaceMembership_workspaceId_userId_key" ON "WorkspaceMembership"("workspaceId", "userId");
CREATE INDEX "WorkspaceMembership_userId_status_idx" ON "WorkspaceMembership"("userId", "status");
CREATE INDEX "WorkspaceMembership_workspaceId_status_idx" ON "WorkspaceMembership"("workspaceId", "status");
ALTER TABLE "WorkspaceMembership"
  ADD CONSTRAINT "WorkspaceMembership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "WorkspaceMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "WorkspaceMembership" ("id", "workspaceId", "userId", "role", "status", "isOwner", "joinedAt", "createdAt", "updatedAt")
SELECT 'wsm_' || md5(u."workspaceId" || ':' || u.id), u."workspaceId", u.id, u.role, CASE WHEN u."disabledAt" IS NULL THEN 'active' ELSE 'suspended' END, COALESCE(w."ownerId" = u.id, false), u."createdAt", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "User" u
JOIN "Workspace" w ON w.id = u."workspaceId"
WHERE u."workspaceId" IS NOT NULL
ON CONFLICT ("workspaceId", "userId") DO NOTHING;

CREATE TABLE "UsageMetric" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UsageMetric_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UsageMetric_workspaceId_metric_period_key" ON "UsageMetric"("workspaceId", "metric", "period");
CREATE INDEX "UsageMetric_workspaceId_period_idx" ON "UsageMetric"("workspaceId", "period");
ALTER TABLE "UsageMetric" ADD CONSTRAINT "UsageMetric_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"(id) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "FeatureFlag" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "value" TEXT,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FeatureFlag_workspaceId_key_key" ON "FeatureFlag"("workspaceId", "key");
ALTER TABLE "FeatureFlag" ADD CONSTRAINT "FeatureFlag_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"(id) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "BackgroundJob" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT,
  "type" TEXT NOT NULL,
  "payload" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'queued',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 5,
  "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BackgroundJob_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "BackgroundJob_status_runAt_idx" ON "BackgroundJob"("status", "runAt");
CREATE INDEX "BackgroundJob_workspaceId_createdAt_idx" ON "BackgroundJob"("workspaceId", "createdAt");
ALTER TABLE "BackgroundJob" ADD CONSTRAINT "BackgroundJob_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"(id) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "NotificationPreference" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "inApp" BOOLEAN NOT NULL DEFAULT true,
  "email" BOOLEAN NOT NULL DEFAULT true,
  "quietStart" TEXT,
  "quietEnd" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NotificationPreference_userId_type_key" ON "NotificationPreference"("userId", "type");
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Plan"
  ADD COLUMN "code" TEXT,
  ADD COLUMN "billingInterval" TEXT NOT NULL DEFAULT 'month',
  ADD COLUMN "seatLimit" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN "storageLimitMb" INTEGER NOT NULL DEFAULT 1024,
  ADD COLUMN "aiRequestLimit" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN "portalUploadLimit" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
UPDATE "Plan" SET "code" = lower(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(id, 1, 6);
ALTER TABLE "Plan" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX "Plan_code_key" ON "Plan"("code");
INSERT INTO "Plan" ("id", "code", "name", "price", "billingInterval", "seatLimit", "storageLimitMb", "aiRequestLimit", "portalUploadLimit", "features", "active", "createdAt", "updatedAt")
VALUES ('plan_trial', 'trial', 'Trial', 0, 'month', 3, 1024, 100, 100, '{"cases":true,"clients":true,"workflow":true,"portal":true,"ai":true}', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

ALTER TABLE "Subscription"
  ALTER COLUMN "status" SET DEFAULT 'trialing',
  ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "trialEndsAt" TIMESTAMP(3),
  ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;

INSERT INTO "Subscription" ("id", "planId", "status", "quantity", "trialEndsAt", "currentPeriodEnd", "createdAt", "updatedAt")
SELECT 'sub_' || md5(w.id), p.id, 'trialing', GREATEST(1, (SELECT COUNT(*)::INTEGER FROM "WorkspaceMembership" m WHERE m."workspaceId" = w.id AND m.status = 'active')), CURRENT_TIMESTAMP + INTERVAL '14 days', CURRENT_TIMESTAMP + INTERVAL '14 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Workspace" w
CROSS JOIN LATERAL (SELECT id FROM "Plan" WHERE code = 'trial' LIMIT 1) p
WHERE w."subscriptionId" IS NULL;

UPDATE "Workspace" w
SET "subscriptionId" = 'sub_' || md5(w.id)
WHERE w."subscriptionId" IS NULL;
