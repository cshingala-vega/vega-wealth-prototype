-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('PENDING', 'MAPPING', 'RUNNING', 'COMPLETE');

-- CreateEnum
CREATE TYPE "ExceptionType" AS ENUM ('STAGE_MISMATCH', 'AMOUNT_FIELD_DIFF', 'MISSING_IN_PORTAL', 'MISSING_IN_TA');

-- CreateEnum
CREATE TYPE "ExceptionResolution" AS ENUM ('OPEN', 'COMMUNICATED', 'RESOLVED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "CommDirection" AS ENUM ('OUTBOUND', 'INBOUND');

-- AlterTable
ALTER TABLE "ColumnMappingTemplate" ADD COLUMN     "transferAgentId" TEXT,
ALTER COLUMN "distributorId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TransferAgent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationRun" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "transferAgentId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "closeCycle" TIMESTAMP(3) NOT NULL,
    "fileName" TEXT NOT NULL,
    "detectedColumns" TEXT[],
    "previewRows" JSONB,
    "status" "ReconciliationStatus" NOT NULL DEFAULT 'PENDING',
    "taRowCount" INTEGER NOT NULL DEFAULT 0,
    "portalOrderCount" INTEGER NOT NULL DEFAULT 0,
    "matchedCount" INTEGER NOT NULL DEFAULT 0,
    "issuesCount" INTEGER NOT NULL DEFAULT 0,
    "matchRate" DOUBLE PRECISION,
    "aiNarrative" TEXT,
    "templateId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReconciliationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exception" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "exceptionType" "ExceptionType" NOT NULL,
    "taTxnId" TEXT,
    "workbenchOrderId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "fundName" TEXT,
    "fieldDiffs" JSONB,
    "aiPriority" INTEGER NOT NULL DEFAULT 5,
    "aiRootCause" TEXT,
    "isPersistent" BOOLEAN NOT NULL DEFAULT false,
    "firstSeenRunId" TEXT,
    "firstSeenAt" TIMESTAMP(3),
    "resolution" "ExceptionResolution" NOT NULL DEFAULT 'OPEN',
    "resolutionReason" TEXT,
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunDelta" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "previousRunId" TEXT,
    "newExceptions" INTEGER NOT NULL DEFAULT 0,
    "resolvedExceptions" INTEGER NOT NULL DEFAULT 0,
    "persistentExceptions" INTEGER NOT NULL DEFAULT 0,
    "aiDeltaSummary" TEXT,

    CONSTRAINT "RunDelta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "counterpartyType" TEXT NOT NULL,
    "counterpartyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseItem" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "exceptionId" TEXT NOT NULL,

    CONSTRAINT "CaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseComm" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "direction" "CommDirection" NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentBy" TEXT NOT NULL,

    CONSTRAINT "CaseComm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransferAgent_organizationId_idx" ON "TransferAgent"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "TransferAgent_name_organizationId_key" ON "TransferAgent"("name", "organizationId");

-- CreateIndex
CREATE INDEX "ReconciliationRun_organizationId_idx" ON "ReconciliationRun"("organizationId");

-- CreateIndex
CREATE INDEX "ReconciliationRun_transferAgentId_idx" ON "ReconciliationRun"("transferAgentId");

-- CreateIndex
CREATE INDEX "ReconciliationRun_fundId_idx" ON "ReconciliationRun"("fundId");

-- CreateIndex
CREATE INDEX "Exception_runId_idx" ON "Exception"("runId");

-- CreateIndex
CREATE INDEX "Exception_organizationId_idx" ON "Exception"("organizationId");

-- CreateIndex
CREATE INDEX "Exception_resolution_idx" ON "Exception"("resolution");

-- CreateIndex
CREATE INDEX "RunDelta_runId_idx" ON "RunDelta"("runId");

-- CreateIndex
CREATE INDEX "Case_organizationId_idx" ON "Case"("organizationId");

-- CreateIndex
CREATE INDEX "CaseItem_caseId_idx" ON "CaseItem"("caseId");

-- CreateIndex
CREATE INDEX "CaseItem_exceptionId_idx" ON "CaseItem"("exceptionId");

-- CreateIndex
CREATE INDEX "CaseComm_caseId_idx" ON "CaseComm"("caseId");

-- CreateIndex
CREATE INDEX "ColumnMappingTemplate_transferAgentId_idx" ON "ColumnMappingTemplate"("transferAgentId");

-- AddForeignKey
ALTER TABLE "TransferAgent" ADD CONSTRAINT "TransferAgent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColumnMappingTemplate" ADD CONSTRAINT "ColumnMappingTemplate_transferAgentId_fkey" FOREIGN KEY ("transferAgentId") REFERENCES "TransferAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationRun" ADD CONSTRAINT "ReconciliationRun_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationRun" ADD CONSTRAINT "ReconciliationRun_transferAgentId_fkey" FOREIGN KEY ("transferAgentId") REFERENCES "TransferAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationRun" ADD CONSTRAINT "ReconciliationRun_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationRun" ADD CONSTRAINT "ReconciliationRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationRun" ADD CONSTRAINT "ReconciliationRun_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ColumnMappingTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exception" ADD CONSTRAINT "Exception_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ReconciliationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exception" ADD CONSTRAINT "Exception_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exception" ADD CONSTRAINT "Exception_workbenchOrderId_fkey" FOREIGN KEY ("workbenchOrderId") REFERENCES "WorkbenchOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunDelta" ADD CONSTRAINT "RunDelta_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ReconciliationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseItem" ADD CONSTRAINT "CaseItem_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseItem" ADD CONSTRAINT "CaseItem_exceptionId_fkey" FOREIGN KEY ("exceptionId") REFERENCES "Exception"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseComm" ADD CONSTRAINT "CaseComm_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseComm" ADD CONSTRAINT "CaseComm_sentBy_fkey" FOREIGN KEY ("sentBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
