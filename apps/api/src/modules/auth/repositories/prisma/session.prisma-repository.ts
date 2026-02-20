import { Injectable } from '@nestjs/common';
import {
  TransactionHost,
  InjectTransactionHost,
} from '@nestjs-cls/transactional';
import { Prisma } from '@repo/prisma-db';
import { ISessionPrismaRepository } from './session.prisma-repository.interface';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';
import { ServerConstants } from '../../../../constants/server.constants';

@Injectable()
export class SessionPrismaRepository implements ISessionPrismaRepository {
  constructor(
    @InjectTransactionHost(ServerConstants.TransactionConnectionNames.Prisma)
    protected readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
  ) {}

  protected get delegate(): Prisma.SessionDelegate {
    return this.prismaTxHost.tx.session;
  }

  findMany(
    args?: Prisma.SessionFindManyArgs,
  ): Promise<Prisma.SessionGetPayload<Prisma.SessionFindManyArgs>[]> {
    return this.delegate.findMany(args);
  }
}
