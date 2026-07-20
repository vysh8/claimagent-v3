-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('NEW', 'CHART_UPLOADED', 'OCR_COMPLETE', 'ANALYZED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "DiagnosisRole" AS ENUM ('PDX', 'MCC', 'CC');

-- CreateEnum
CREATE TYPE "ChartStatus" AS ENUM ('UPLOADED', 'OCR_PROCESSING', 'OCR_COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientDemo" TEXT NOT NULL,
    "drgBilled" TEXT NOT NULL,
    "drgBilledDesc" TEXT NOT NULL,
    "charge" INTEGER NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'NEW',
    "seedSource" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimDiagnosis" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "role" "DiagnosisRole" NOT NULL,

    CONSTRAINT "ClaimDiagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalChart" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "blobUrl" TEXT,
    "status" "ChartStatus" NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicalChart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HocrFile" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "blobUrl" TEXT,
    "extractedText" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HocrFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisResult" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "disposition" TEXT NOT NULL,
    "drgFinal" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "narrative" TEXT NOT NULL,
    "recommend" TEXT NOT NULL,
    "guidelinesApplied" JSONB NOT NULL,
    "payment" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "analysisId" TEXT,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Claim_claimNumber_key" ON "Claim"("claimNumber");

-- CreateIndex
CREATE INDEX "ClaimDiagnosis_claimId_idx" ON "ClaimDiagnosis"("claimId");

-- CreateIndex
CREATE INDEX "MedicalChart_claimId_idx" ON "MedicalChart"("claimId");

-- CreateIndex
CREATE INDEX "HocrFile_chartId_idx" ON "HocrFile"("chartId");

-- CreateIndex
CREATE INDEX "AnalysisResult_claimId_idx" ON "AnalysisResult"("claimId");

-- CreateIndex
CREATE INDEX "ChatMessage_claimId_idx" ON "ChatMessage"("claimId");

-- AddForeignKey
ALTER TABLE "ClaimDiagnosis" ADD CONSTRAINT "ClaimDiagnosis_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalChart" ADD CONSTRAINT "MedicalChart_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HocrFile" ADD CONSTRAINT "HocrFile_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "MedicalChart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisResult" ADD CONSTRAINT "AnalysisResult_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "AnalysisResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
