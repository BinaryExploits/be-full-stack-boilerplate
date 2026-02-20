import { Prisma } from '@repo/prisma-db';

export interface IAccountPrismaRepository {
  findMany(
    args?: Prisma.AccountFindManyArgs,
  ): Promise<Prisma.AccountGetPayload<Prisma.AccountFindManyArgs>[]>;
}
