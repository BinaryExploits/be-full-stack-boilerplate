import { Prisma } from '@repo/prisma-db';

export interface IGlobalCrudPrismaRepository {
  create(
    args: Prisma.GlobalCrudCreateArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudCreateArgs>>;
  createMany(
    args: Prisma.GlobalCrudCreateManyArgs,
  ): Promise<Prisma.BatchPayload>;

  findFirst(
    args?: Prisma.GlobalCrudFindFirstArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudFindFirstArgs> | null>;
  findUnique(
    args: Prisma.GlobalCrudFindUniqueArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudFindUniqueArgs> | null>;
  findMany(
    args?: Prisma.GlobalCrudFindManyArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudFindManyArgs>[]>;

  update(
    args: Prisma.GlobalCrudUpdateArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudUpdateArgs>>;
  updateMany(
    args: Prisma.GlobalCrudUpdateManyArgs,
  ): Promise<Prisma.BatchPayload>;
  upsert(
    args: Prisma.GlobalCrudUpsertArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudUpsertArgs>>;

  delete(
    args: Prisma.GlobalCrudDeleteArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudDeleteArgs>>;
  deleteMany(
    args?: Prisma.GlobalCrudDeleteManyArgs,
  ): Promise<Prisma.BatchPayload>;

  count(args?: Prisma.GlobalCrudCountArgs): Promise<number>;
  aggregate(
    args: Prisma.GlobalCrudAggregateArgs,
  ): Promise<Prisma.GetGlobalCrudAggregateType<Prisma.GlobalCrudAggregateArgs>>;
}
