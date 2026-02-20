import { Injectable } from '@nestjs/common';
import {
  TransactionHost,
  InjectTransactionHost,
} from '@nestjs-cls/transactional';
import { Prisma } from '@repo/prisma-db';
import { IGdprAuditLogPrismaRepository } from './gdpr-audit-log.prisma-repository.interface';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';
import { ServerConstants } from '../../../../constants/server.constants';

@Injectable()
export class GdprAuditLogPrismaRepository implements IGdprAuditLogPrismaRepository {
  constructor(
    @InjectTransactionHost(ServerConstants.TransactionConnectionNames.Prisma)
    protected readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
  ) {}

  protected get delegate(): Prisma.GdprAuditLogDelegate {
    return this.prismaTxHost.tx.gdprAuditLog;
  }

  create(
    args: Prisma.GdprAuditLogCreateArgs,
  ): Promise<Prisma.GdprAuditLogGetPayload<Prisma.GdprAuditLogCreateArgs>> {
    return this.delegate.create(args);
  }
}
