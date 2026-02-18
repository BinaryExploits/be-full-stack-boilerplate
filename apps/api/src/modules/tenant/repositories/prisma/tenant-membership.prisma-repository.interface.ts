import { Prisma } from '@repo/prisma-db';

export interface ITenantMembershipPrismaRepository {
  create(
    args: Prisma.TenantMembershipCreateArgs,
  ): Promise<
    Prisma.TenantMembershipGetPayload<Prisma.TenantMembershipCreateArgs>
  >;
  createMany(
    args: Prisma.TenantMembershipCreateManyArgs,
  ): Promise<Prisma.BatchPayload>;

  findFirst(
    args?: Prisma.TenantMembershipFindFirstArgs,
  ): Promise<Prisma.TenantMembershipGetPayload<Prisma.TenantMembershipFindFirstArgs> | null>;
  findUnique(
    args: Prisma.TenantMembershipFindUniqueArgs,
  ): Promise<Prisma.TenantMembershipGetPayload<Prisma.TenantMembershipFindUniqueArgs> | null>;
  findMany(
    args?: Prisma.TenantMembershipFindManyArgs,
  ): Promise<
    Prisma.TenantMembershipGetPayload<Prisma.TenantMembershipFindManyArgs>[]
  >;

  update(
    args: Prisma.TenantMembershipUpdateArgs,
  ): Promise<
    Prisma.TenantMembershipGetPayload<Prisma.TenantMembershipUpdateArgs>
  >;
  updateMany(
    args: Prisma.TenantMembershipUpdateManyArgs,
  ): Promise<Prisma.BatchPayload>;
  upsert(
    args: Prisma.TenantMembershipUpsertArgs,
  ): Promise<
    Prisma.TenantMembershipGetPayload<Prisma.TenantMembershipUpsertArgs>
  >;

  delete(
    args: Prisma.TenantMembershipDeleteArgs,
  ): Promise<
    Prisma.TenantMembershipGetPayload<Prisma.TenantMembershipDeleteArgs>
  >;
  deleteMany(
    args?: Prisma.TenantMembershipDeleteManyArgs,
  ): Promise<Prisma.BatchPayload>;

  count(args?: Prisma.TenantMembershipCountArgs): Promise<number>;
  aggregate(
    args: Prisma.TenantMembershipAggregateArgs,
  ): Promise<
    Prisma.GetTenantMembershipAggregateType<Prisma.TenantMembershipAggregateArgs>
  >;
}
