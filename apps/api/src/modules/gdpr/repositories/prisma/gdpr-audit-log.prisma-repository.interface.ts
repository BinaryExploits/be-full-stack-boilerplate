import { Prisma } from '@repo/prisma-db';

export interface IGdprAuditLogPrismaRepository {
  create(
    args: Prisma.GdprAuditLogCreateArgs,
  ): Promise<Prisma.GdprAuditLogGetPayload<Prisma.GdprAuditLogCreateArgs>>;
}
