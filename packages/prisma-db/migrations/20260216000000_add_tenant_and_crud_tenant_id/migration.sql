-- CreateTable
CREATE TABLE "tenant" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "allowedOrigins" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant"("slug");

-- AlterTable: add tenantId to crud (optional for backward compatibility)
ALTER TABLE "crud" ADD COLUMN "tenantId" TEXT;

-- CreateIndex
CREATE INDEX "crud_tenantId_idx" ON "crud"("tenantId");

-- AddForeignKey
ALTER TABLE "crud" ADD CONSTRAINT "crud_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: global CRUD (shared across all tenants)
CREATE TABLE "global_crud" (
    "id" TEXT NOT NULL,
    "content" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_crud_pkey" PRIMARY KEY ("id")
);
