-- CreateEnum
CREATE TYPE "IngestionStatus" AS ENUM ('PENDING', 'MAPPING', 'REVIEW', 'COMMITTED');

-- CreateTable
CREATE TABLE "Fund" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[],
    "shareClasses" TEXT[],
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distributor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Distributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColumnMappingTemplate" (
    "id" TEXT NOT NULL,
    "distributorId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mappingJson" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColumnMappingTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionRun" (
    "id" TEXT NOT NULL,
    "distributorId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "closeCycle" TIMESTAMP(3) NOT NULL,
    "fileName" TEXT NOT NULL,
    "detectedColumns" TEXT[],
    "previewRows" JSONB,
    "status" "IngestionStatus" NOT NULL DEFAULT 'PENDING',
    "rowsProcessed" INTEGER NOT NULL DEFAULT 0,
    "rowsIngested" INTEGER NOT NULL DEFAULT 0,
    "rowsExcluded" INTEGER NOT NULL DEFAULT 0,
    "rowsFlagged" INTEGER NOT NULL DEFAULT 0,
    "aiQualityScore" DOUBLE PRECISION,
    "aiSummary" TEXT,
    "templateId" TEXT,
    "committedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngestionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkbenchOrder" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "fundName" TEXT,
    "shareClass" TEXT,
    "investorName" TEXT,
    "status" TEXT,
    "currency" TEXT,
    "aiFlags" JSONB,
    "isExcluded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkbenchOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Fund_organizationId_idx" ON "Fund"("organizationId");

-- CreateIndex
CREATE INDEX "Distributor_organizationId_idx" ON "Distributor"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Distributor_name_organizationId_key" ON "Distributor"("name", "organizationId");

-- CreateIndex
CREATE INDEX "ColumnMappingTemplate_distributorId_idx" ON "ColumnMappingTemplate"("distributorId");

-- CreateIndex
CREATE INDEX "ColumnMappingTemplate_organizationId_idx" ON "ColumnMappingTemplate"("organizationId");

-- CreateIndex
CREATE INDEX "IngestionRun_organizationId_idx" ON "IngestionRun"("organizationId");

-- CreateIndex
CREATE INDEX "IngestionRun_distributorId_idx" ON "IngestionRun"("distributorId");

-- CreateIndex
CREATE INDEX "IngestionRun_userId_idx" ON "IngestionRun"("userId");

-- CreateIndex
CREATE INDEX "WorkbenchOrder_runId_idx" ON "WorkbenchOrder"("runId");

-- CreateIndex
CREATE INDEX "WorkbenchOrder_organizationId_idx" ON "WorkbenchOrder"("organizationId");

-- AddForeignKey
ALTER TABLE "Fund" ADD CONSTRAINT "Fund_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distributor" ADD CONSTRAINT "Distributor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColumnMappingTemplate" ADD CONSTRAINT "ColumnMappingTemplate_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColumnMappingTemplate" ADD CONSTRAINT "ColumnMappingTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngestionRun" ADD CONSTRAINT "IngestionRun_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngestionRun" ADD CONSTRAINT "IngestionRun_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngestionRun" ADD CONSTRAINT "IngestionRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngestionRun" ADD CONSTRAINT "IngestionRun_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ColumnMappingTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbenchOrder" ADD CONSTRAINT "WorkbenchOrder_runId_fkey" FOREIGN KEY ("runId") REFERENCES "IngestionRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbenchOrder" ADD CONSTRAINT "WorkbenchOrder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
