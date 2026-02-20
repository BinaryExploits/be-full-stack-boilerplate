import { Injectable } from '@nestjs/common';
import {
  TransactionHost,
  InjectTransactionHost,
} from '@nestjs-cls/transactional';
import { Prisma } from '@repo/prisma-db';
import { IUserPrismaRepository } from './user.prisma-repository.interface';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';
import { ServerConstants } from '../../../../constants/server.constants';

@Injectable()
export class UserPrismaRepository implements IUserPrismaRepository {
  constructor(
    @InjectTransactionHost(ServerConstants.TransactionConnectionNames.Prisma)
    protected readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
  ) {}

  protected get delegate(): Prisma.UserDelegate {
    return this.prismaTxHost.tx.user;
  }

  findUniqueOrThrow(
    args: Prisma.UserFindUniqueOrThrowArgs,
  ): Promise<Prisma.UserGetPayload<Prisma.UserFindUniqueOrThrowArgs>> {
    return this.delegate.findUniqueOrThrow(args);
  }

  update(
    args: Prisma.UserUpdateArgs,
  ): Promise<Prisma.UserGetPayload<Prisma.UserUpdateArgs>> {
    return this.delegate.update(args);
  }
}
