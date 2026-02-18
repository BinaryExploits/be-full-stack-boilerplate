import { Prisma } from '@repo/prisma-db';

export interface IUserProfilePrismaRepository {
  create(
    args: Prisma.UserProfileCreateArgs,
  ): Promise<Prisma.UserProfileGetPayload<Prisma.UserProfileCreateArgs>>;
  createMany(
    args: Prisma.UserProfileCreateManyArgs,
  ): Promise<Prisma.BatchPayload>;

  findFirst(
    args?: Prisma.UserProfileFindFirstArgs,
  ): Promise<Prisma.UserProfileGetPayload<Prisma.UserProfileFindFirstArgs> | null>;
  findUnique(
    args: Prisma.UserProfileFindUniqueArgs,
  ): Promise<Prisma.UserProfileGetPayload<Prisma.UserProfileFindUniqueArgs> | null>;
  findMany(
    args?: Prisma.UserProfileFindManyArgs,
  ): Promise<Prisma.UserProfileGetPayload<Prisma.UserProfileFindManyArgs>[]>;

  update(
    args: Prisma.UserProfileUpdateArgs,
  ): Promise<Prisma.UserProfileGetPayload<Prisma.UserProfileUpdateArgs>>;
  updateMany(
    args: Prisma.UserProfileUpdateManyArgs,
  ): Promise<Prisma.BatchPayload>;
  upsert(
    args: Prisma.UserProfileUpsertArgs,
  ): Promise<Prisma.UserProfileGetPayload<Prisma.UserProfileUpsertArgs>>;

  delete(
    args: Prisma.UserProfileDeleteArgs,
  ): Promise<Prisma.UserProfileGetPayload<Prisma.UserProfileDeleteArgs>>;
  deleteMany(
    args?: Prisma.UserProfileDeleteManyArgs,
  ): Promise<Prisma.BatchPayload>;

  count(args?: Prisma.UserProfileCountArgs): Promise<number>;
  aggregate(
    args: Prisma.UserProfileAggregateArgs,
  ): Promise<
    Prisma.GetUserProfileAggregateType<Prisma.UserProfileAggregateArgs>
  >;
}
