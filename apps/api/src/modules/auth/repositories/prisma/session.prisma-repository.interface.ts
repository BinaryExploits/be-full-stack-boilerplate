import { Prisma } from '@repo/prisma-db';

export interface ISessionPrismaRepository {
  findMany(
    args?: Prisma.SessionFindManyArgs,
  ): Promise<Prisma.SessionGetPayload<Prisma.SessionFindManyArgs>[]>;
}
