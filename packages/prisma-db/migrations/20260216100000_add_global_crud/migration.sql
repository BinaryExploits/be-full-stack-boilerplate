-- CreateTable: global CRUD (shared across all tenants)
CREATE TABLE "global_crud" (
    "id" TEXT NOT NULL,
    "content" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_crud_pkey" PRIMARY KEY ("id")
);
