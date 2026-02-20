import { Injectable } from '@nestjs/common';
import {
  TransactionHost,
  InjectTransactionHost,
} from '@nestjs-cls/transactional';
import { Prisma } from '@repo/prisma-db';
import { IAccountPrismaRepository } from './account.prisma-repository.interface';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';
import { ServerConstants } from '../../../../constants/server.constants';

@Injectable()
export class AccountPrismaRepository implements IAccountPrismaRepository {
  constructor(
    @InjectTransactionHost(ServerConstants.TransactionConnectionNames.Prisma)
    protected readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
  ) {}

  protected get delegate(): Prisma.AccountDelegate {
    return this.prismaTxHost.tx.account;
  }

  findMany(
    args?: Prisma.AccountFindManyArgs,
  ): Promise<Prisma.AccountGetPayload<Prisma.AccountFindManyArgs>[]> {
    return this.delegate.findMany(args);
  }
}
