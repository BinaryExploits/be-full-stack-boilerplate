import { Prisma } from '@repo/prisma-db';

export interface IUserPrismaRepository {
  findUniqueOrThrow(
    args: Prisma.UserFindUniqueOrThrowArgs,
  ): Promise<Prisma.UserGetPayload<Prisma.UserFindUniqueOrThrowArgs>>;

  update(
    args: Prisma.UserUpdateArgs,
  ): Promise<Prisma.UserGetPayload<Prisma.UserUpdateArgs>>;
}
