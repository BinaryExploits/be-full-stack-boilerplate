import { Prisma } from '@repo/prisma-db';

export interface IGdprAuditLogPrismaRepository {
  create(
    args: Prisma.GdprAuditLogCreateArgs,
  ): Promise<
    Prisma.GdprAuditLogGetPayload<Prisma.GdprAuditLogCreateArgs>
  >;

  findMany(
    args?: Prisma.GdprAuditLogFindManyArgs,
  ): Promise<
    Prisma.GdprAuditLogGetPayload<Prisma.GdprAuditLogFindManyArgs>[]
  >;

  deleteMany(
    args?: Prisma.GdprAuditLogDeleteManyArgs,
  ): Promise<Prisma.BatchPayload>;
}
