import { Injectable } from '@nestjs/common';
import {
  TransactionHost,
  InjectTransactionHost,
} from '@nestjs-cls/transactional';
import { Prisma } from '@repo/prisma-db';
import { IUserProfilePrismaRepository } from './user-profile.prisma-repository.interface';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';
import { ServerConstants } from '../../../../constants/server.constants';

@Injectable()
export class UserProfilePrismaRepository implements IUserProfilePrismaRepository {
  constructor(
    @InjectTransactionHost(ServerConstants.TransactionConnectionNames.Prisma)
    protected readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
  ) {}

  protected get delegate(): Prisma.UserProfileDelegate {
    return this.prismaTxHost.tx.userProfile;
  }

  create(
    args: Prisma.UserProfileCreateArgs,
  ): Promise<Prisma.UserProfileGetPayload<Prisma.UserProfileCreateArgs>> {
    return this.delegate.create(args);
  }

  createMany(
    args: Prisma.UserProfileCreateManyArgs,
  ): Promise<Prisma.BatchPayload> {
    return this.delegate.createMany(args);
  }

  findFirst(
    args?: Prisma.UserProfileFindFirstArgs,
  ): Promise<Prisma.UserProfileGetPayload<Prisma.UserProfileFindFirstArgs> | null> {
    return this.delegate.findFirst(args);
  }

  findUnique(
    args: Prisma.UserProfileFindUniqueArgs,
  ): Promise<Prisma.UserProfileGetPayload<Prisma.UserProfileFindUniqueArgs> | null> {
    return this.delegate.findUnique(args);
  }

  findMany(
    args?: Prisma.UserProfileFindManyArgs,
  ): Promise<Prisma.UserProfileGetPayload<Prisma.UserProfileFindManyArgs>[]> {
    return this.delegate.findMany(args);
  }

  update(
    args: Prisma.UserProfileUpdateArgs,
  ): Promise<Prisma.UserProfileGetPayload<Prisma.UserProfileUpdateArgs>> {
    return this.delegate.update(args);
  }

  updateMany(
    args: Prisma.UserProfileUpdateManyArgs,
  ): Promise<Prisma.BatchPayload> {
    return this.delegate.updateMany(args);
  }

  upsert(
    args: Prisma.UserProfileUpsertArgs,
  ): Promise<Prisma.UserProfileGetPayload<Prisma.UserProfileUpsertArgs>> {
    return this.delegate.upsert(args);
  }

  delete(
    args: Prisma.UserProfileDeleteArgs,
  ): Promise<Prisma.UserProfileGetPayload<Prisma.UserProfileDeleteArgs>> {
    return this.delegate.delete(args);
  }

  deleteMany(
    args?: Prisma.UserProfileDeleteManyArgs,
  ): Promise<Prisma.BatchPayload> {
    return this.delegate.deleteMany(args);
  }

  count(args?: Prisma.UserProfileCountArgs): Promise<number> {
    return this.delegate.count(args);
  }

  aggregate(
    args: Prisma.UserProfileAggregateArgs,
  ): Promise<
    Prisma.GetUserProfileAggregateType<Prisma.UserProfileAggregateArgs>
  > {
    return this.delegate.aggregate(args);
  }
}
