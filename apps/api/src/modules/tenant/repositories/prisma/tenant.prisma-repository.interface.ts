import { Prisma } from '@repo/prisma-db';

export interface ITenantPrismaRepository {
  create(
    args: Prisma.TenantCreateArgs,
  ): Promise<Prisma.TenantGetPayload<Prisma.TenantCreateArgs>>;
  createMany(args: Prisma.TenantCreateManyArgs): Promise<Prisma.BatchPayload>;

  findFirst(
    args?: Prisma.TenantFindFirstArgs,
  ): Promise<Prisma.TenantGetPayload<Prisma.TenantFindFirstArgs> | null>;
  findUnique(
    args: Prisma.TenantFindUniqueArgs,
  ): Promise<Prisma.TenantGetPayload<Prisma.TenantFindUniqueArgs> | null>;
  findMany(
    args?: Prisma.TenantFindManyArgs,
  ): Promise<Prisma.TenantGetPayload<Prisma.TenantFindManyArgs>[]>;

  update(
    args: Prisma.TenantUpdateArgs,
  ): Promise<Prisma.TenantGetPayload<Prisma.TenantUpdateArgs>>;
  updateMany(args: Prisma.TenantUpdateManyArgs): Promise<Prisma.BatchPayload>;
  upsert(
    args: Prisma.TenantUpsertArgs,
  ): Promise<Prisma.TenantGetPayload<Prisma.TenantUpsertArgs>>;

  delete(
    args: Prisma.TenantDeleteArgs,
  ): Promise<Prisma.TenantGetPayload<Prisma.TenantDeleteArgs>>;
  deleteMany(args?: Prisma.TenantDeleteManyArgs): Promise<Prisma.BatchPayload>;

  count(args?: Prisma.TenantCountArgs): Promise<number>;
  aggregate(
    args: Prisma.TenantAggregateArgs,
  ): Promise<Prisma.GetTenantAggregateType<Prisma.TenantAggregateArgs>>;
}
