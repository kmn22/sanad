-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('LAW_FIRM', 'ENTERPRISE_CORP', 'SME_STARTUP', 'ACADEMIC_INSTITUTION');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE_TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'SOVEREIGN_DEDICATED');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CORPORATE_COUNSEL', 'ATTORNEY', 'PARALEGAL', 'GRC_OFFICER', 'LAW_STUDENT', 'CLIENT');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('SUPER_ADMIN', 'MANAGING_PARTNER', 'SENIOR_LEGAL_COUNSEL', 'ASSOCIATE', 'COMPLIANCE_LEAD', 'TRAINEE_STUDENT', 'VIEWER_CLIENT');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'LEGAL_REVIEW', 'NEGOTIATION', 'APPROVED', 'SIGNED', 'ACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'PRE_TRIAL', 'IN_LITIGATION', 'IN_HEARING', 'PENDING_APPEAL', 'ON_APPEAL', 'STAYED', 'SETTLED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'IN_REVIEW', 'NON_COMPLIANT');

-- CreateEnum
CREATE TYPE "KnowledgeCategory" AS ENUM ('LEGAL_PRECEDENT', 'RESEARCH_PAPER', 'TEMPLATE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT,
ADD COLUMN IF NOT EXISTS "fullName" TEXT,
ADD COLUMN IF NOT EXISTS "userType" "UserType" NOT NULL DEFAULT 'ATTORNEY';

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "orgId" TEXT,
ADD COLUMN IF NOT EXISTS "settings" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL DEFAULT 'LAW_FIRM',
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'PROFESSIONAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'ASSOCIATE',
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ContractLifecycle" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "orgId" TEXT,
    "title" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "effectiveDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractLifecycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LitigationCase" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "orgId" TEXT,
    "caseNumber" TEXT NOT NULL,
    "courtType" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "clientReference" TEXT,
    "plaintiff" TEXT NOT NULL,
    "defendant" TEXT NOT NULL,
    "currentStatus" "CaseStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LitigationCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CaseSession" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "orgId" TEXT,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "proceduralDeadline" TIMESTAMP(3),
    "summary" TEXT NOT NULL,
    "courtDecision" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ComplianceTracker" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "regulationDomain" TEXT NOT NULL,
    "requirementTitle" TEXT NOT NULL,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'IN_REVIEW',
    "auditDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "KnowledgeResearchItem" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "orgId" TEXT,
    "category" "KnowledgeCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeResearchItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Organization_slug_key" ON "Organization"("slug");
CREATE INDEX IF NOT EXISTS "Organization_type_tier_idx" ON "Organization"("type", "tier");
CREATE INDEX IF NOT EXISTS "Organization_createdAt_idx" ON "Organization"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Membership_orgId_role_isActive_idx" ON "Membership"("orgId", "role", "isActive");
CREATE INDEX IF NOT EXISTS "Membership_userId_isActive_idx" ON "Membership"("userId", "isActive");
CREATE UNIQUE INDEX IF NOT EXISTS "Membership_userId_orgId_key" ON "Membership"("userId", "orgId");

CREATE INDEX IF NOT EXISTS "ContractLifecycle_workspaceId_status_idx" ON "ContractLifecycle"("workspaceId", "status");
CREATE INDEX IF NOT EXISTS "ContractLifecycle_orgId_status_riskLevel_idx" ON "ContractLifecycle"("orgId", "status", "riskLevel");
CREATE INDEX IF NOT EXISTS "ContractLifecycle_workspaceId_expiryDate_idx" ON "ContractLifecycle"("workspaceId", "expiryDate");
CREATE INDEX IF NOT EXISTS "ContractLifecycle_effectiveDate_expiryDate_idx" ON "ContractLifecycle"("effectiveDate", "expiryDate");

CREATE INDEX IF NOT EXISTS "LitigationCase_workspaceId_currentStatus_stage_idx" ON "LitigationCase"("workspaceId", "currentStatus", "stage");
CREATE INDEX IF NOT EXISTS "LitigationCase_orgId_currentStatus_idx" ON "LitigationCase"("orgId", "currentStatus");
CREATE INDEX IF NOT EXISTS "LitigationCase_caseNumber_idx" ON "LitigationCase"("caseNumber");
CREATE INDEX IF NOT EXISTS "LitigationCase_clientReference_idx" ON "LitigationCase"("clientReference");
CREATE UNIQUE INDEX IF NOT EXISTS "LitigationCase_workspaceId_caseNumber_key" ON "LitigationCase"("workspaceId", "caseNumber");

CREATE INDEX IF NOT EXISTS "CaseSession_caseId_sessionDate_idx" ON "CaseSession"("caseId", "sessionDate" DESC);
CREATE INDEX IF NOT EXISTS "CaseSession_orgId_proceduralDeadline_idx" ON "CaseSession"("orgId", "proceduralDeadline");
CREATE INDEX IF NOT EXISTS "CaseSession_orgId_sessionDate_idx" ON "CaseSession"("orgId", "sessionDate");

CREATE INDEX IF NOT EXISTS "ComplianceTracker_orgId_status_idx" ON "ComplianceTracker"("orgId", "status");
CREATE INDEX IF NOT EXISTS "ComplianceTracker_orgId_regulationDomain_status_idx" ON "ComplianceTracker"("orgId", "regulationDomain", "status");
CREATE INDEX IF NOT EXISTS "ComplianceTracker_orgId_auditDate_idx" ON "ComplianceTracker"("orgId", "auditDate");

CREATE INDEX IF NOT EXISTS "KnowledgeResearchItem_orgId_category_isPublic_idx" ON "KnowledgeResearchItem"("orgId", "category", "isPublic");
CREATE INDEX IF NOT EXISTS "KnowledgeResearchItem_isPublic_category_createdAt_idx" ON "KnowledgeResearchItem"("isPublic", "category", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "KnowledgeResearchItem_authorId_category_idx" ON "KnowledgeResearchItem"("authorId", "category");
CREATE INDEX IF NOT EXISTS "KnowledgeResearchItem_tags_idx" ON "KnowledgeResearchItem" USING GIN ("tags");

CREATE INDEX IF NOT EXISTS "User_userType_idx" ON "User"("userType");
CREATE INDEX IF NOT EXISTS "Workspace_orgId_type_idx" ON "Workspace"("orgId", "type");
CREATE INDEX IF NOT EXISTS "Workspace_orgId_status_idx" ON "Workspace"("orgId", "status");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContractLifecycle" ADD CONSTRAINT "ContractLifecycle_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LitigationCase" ADD CONSTRAINT "LitigationCase_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseSession" ADD CONSTRAINT "CaseSession_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "LitigationCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ComplianceTracker" ADD CONSTRAINT "ComplianceTracker_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnowledgeResearchItem" ADD CONSTRAINT "KnowledgeResearchItem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnowledgeResearchItem" ADD CONSTRAINT "KnowledgeResearchItem_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

