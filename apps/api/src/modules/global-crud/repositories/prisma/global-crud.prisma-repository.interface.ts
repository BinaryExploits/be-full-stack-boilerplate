import { Prisma } from '@repo/prisma-db';

export interface IGlobalCrudPrismaRepository {
  create(
    args: Prisma.GlobalCrudCreateArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudCreateArgs>>;
  findUnique(
    args: Prisma.GlobalCrudFindUniqueArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudFindUniqueArgs> | null>;
  findMany(
    args?: Prisma.GlobalCrudFindManyArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudFindManyArgs>[]>;
  update(
    args: Prisma.GlobalCrudUpdateArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudUpdateArgs>>;
  delete(
    args: Prisma.GlobalCrudDeleteArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudDeleteArgs>>;
}
