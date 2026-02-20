-- AlterTable
ALTER TABLE "user" ADD COLUMN     "consentAt" TIMESTAMP(3),
ADD COLUMN     "consentGiven" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consentIp" TEXT;

-- CreateTable
CREATE TABLE "gdpr_audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gdpr_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gdpr_audit_log_userId_idx" ON "gdpr_audit_log"("userId");
