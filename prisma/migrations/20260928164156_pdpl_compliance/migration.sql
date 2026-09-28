-- CreateTable
CREATE TABLE "PrivacyNotice" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retiredAt" TIMESTAMP(3),

    CONSTRAINT "PrivacyNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivacyAcceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivacyAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'granted',
    "noticeVersion" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" TIMESTAMP(3),
    "evidence" TEXT,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSubjectRequest" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "userId" TEXT,
    "requesterEmail" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'received',
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "extendedDueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "assignedToId" TEXT,
    "responseNotes" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "DataSubjectRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetentionPolicy" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "retentionDays" INTEGER NOT NULL,
    "legalBasis" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetentionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalHold" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),
    "releasedById" TEXT,

    CONSTRAINT "LegalHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivacyIncident" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'investigating',
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "awareAt" TIMESTAMP(3) NOT NULL,
    "authorityDueAt" TIMESTAMP(3) NOT NULL,
    "authorityNotifiedAt" TIMESTAMP(3),
    "subjectsNotifiedAt" TIMESTAMP(3),
    "affectedSubjects" INTEGER,
    "dataCategories" TEXT,
    "riskAssessment" TEXT,
    "containmentActions" TEXT,
    "correctiveActions" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivacyIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessorRegister" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "dataCategories" TEXT NOT NULL,
    "processingLocation" TEXT NOT NULL,
    "contractReference" TEXT,
    "securityReviewAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessorRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferAssessment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "processorId" TEXT,
    "destinationCountry" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "dataCategories" TEXT NOT NULL,
    "safeguard" TEXT NOT NULL,
    "riskAssessment" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataProtectionImpactAssessment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "processing" TEXT NOT NULL,
    "necessity" TEXT NOT NULL,
    "risks" TEXT NOT NULL,
    "mitigations" TEXT NOT NULL,
    "residualRisk" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataProtectionImpactAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataAccessEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataAccessEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrivacyNotice_publishedAt_idx" ON "PrivacyNotice"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacyNotice_version_locale_key" ON "PrivacyNotice"("version", "locale");

-- CreateIndex
CREATE INDEX "PrivacyAcceptance_userId_idx" ON "PrivacyAcceptance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacyAcceptance_userId_noticeId_key" ON "PrivacyAcceptance"("userId", "noticeId");

-- CreateIndex
CREATE INDEX "ConsentRecord_userId_idx" ON "ConsentRecord"("userId");

-- CreateIndex
CREATE INDEX "ConsentRecord_workspaceId_idx" ON "ConsentRecord"("workspaceId");

-- CreateIndex
CREATE INDEX "ConsentRecord_purpose_idx" ON "ConsentRecord"("purpose");

-- CreateIndex
CREATE INDEX "DataSubjectRequest_workspaceId_idx" ON "DataSubjectRequest"("workspaceId");

-- CreateIndex
CREATE INDEX "DataSubjectRequest_requesterEmail_idx" ON "DataSubjectRequest"("requesterEmail");

-- CreateIndex
CREATE INDEX "DataSubjectRequest_status_dueAt_idx" ON "DataSubjectRequest"("status", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "RetentionPolicy_workspaceId_entityType_key" ON "RetentionPolicy"("workspaceId", "entityType");

-- CreateIndex
CREATE INDEX "LegalHold_workspaceId_idx" ON "LegalHold"("workspaceId");

-- CreateIndex
CREATE INDEX "LegalHold_entityType_entityId_idx" ON "LegalHold"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "PrivacyIncident_workspaceId_idx" ON "PrivacyIncident"("workspaceId");

-- CreateIndex
CREATE INDEX "PrivacyIncident_status_authorityDueAt_idx" ON "PrivacyIncident"("status", "authorityDueAt");

-- CreateIndex
CREATE INDEX "ProcessorRegister_workspaceId_idx" ON "ProcessorRegister"("workspaceId");

-- CreateIndex
CREATE INDEX "TransferAssessment_workspaceId_idx" ON "TransferAssessment"("workspaceId");

-- CreateIndex
CREATE INDEX "DataProtectionImpactAssessment_workspaceId_idx" ON "DataProtectionImpactAssessment"("workspaceId");

-- CreateIndex
CREATE INDEX "DataAccessEvent_workspaceId_idx" ON "DataAccessEvent"("workspaceId");

-- CreateIndex
CREATE INDEX "DataAccessEvent_entityType_entityId_idx" ON "DataAccessEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "DataAccessEvent_userId_createdAt_idx" ON "DataAccessEvent"("userId", "createdAt");
