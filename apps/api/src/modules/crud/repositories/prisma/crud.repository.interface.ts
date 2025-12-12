import { Prisma } from '@repo/prisma-db';

export interface CrudRepositoryInterface {
  create(
    args: Prisma.CrudCreateArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudCreateArgs>>;
  createMany(args: Prisma.CrudCreateManyArgs): Promise<Prisma.BatchPayload>;

  findFirst(
    args?: Prisma.CrudFindFirstArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudFindFirstArgs> | null>;
  findUnique(
    args: Prisma.CrudFindUniqueArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudFindUniqueArgs> | null>;
  findMany(
    args?: Prisma.CrudFindManyArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudFindManyArgs>[]>;

  update(
    args: Prisma.CrudUpdateArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudUpdateArgs>>;
  updateMany(args: Prisma.CrudUpdateManyArgs): Promise<Prisma.BatchPayload>;
  upsert(
    args: Prisma.CrudUpsertArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudUpsertArgs>>;

  delete(
    args: Prisma.CrudDeleteArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudDeleteArgs>>;
  deleteMany(args?: Prisma.CrudDeleteManyArgs): Promise<Prisma.BatchPayload>;

  count(args?: Prisma.CrudCountArgs): Promise<number>;
  aggregate(
    args: Prisma.CrudAggregateArgs,
  ): Promise<Prisma.GetCrudAggregateType<Prisma.CrudAggregateArgs>>;
}
