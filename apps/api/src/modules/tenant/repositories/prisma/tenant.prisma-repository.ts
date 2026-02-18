import { Injectable } from '@nestjs/common';
import {
  TransactionHost,
  InjectTransactionHost,
} from '@nestjs-cls/transactional';
import { Prisma } from '@repo/prisma-db';
import { ITenantPrismaRepository } from './tenant.prisma-repository.interface';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';
import { ServerConstants } from '../../../../constants/server.constants';

@Injectable()
export class TenantPrismaRepository implements ITenantPrismaRepository {
  constructor(
    @InjectTransactionHost(ServerConstants.TransactionConnectionNames.Prisma)
    protected readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
  ) {}

  protected get delegate(): Prisma.TenantDelegate {
    return this.prismaTxHost.tx.tenant;
  }

  create(
    args: Prisma.TenantCreateArgs,
  ): Promise<Prisma.TenantGetPayload<Prisma.TenantCreateArgs>> {
    return this.delegate.create(args);
  }

  createMany(args: Prisma.TenantCreateManyArgs): Promise<Prisma.BatchPayload> {
    return this.delegate.createMany(args);
  }

  findFirst(
    args?: Prisma.TenantFindFirstArgs,
  ): Promise<Prisma.TenantGetPayload<Prisma.TenantFindFirstArgs> | null> {
    return this.delegate.findFirst(args);
  }

  findUnique(
    args: Prisma.TenantFindUniqueArgs,
  ): Promise<Prisma.TenantGetPayload<Prisma.TenantFindUniqueArgs> | null> {
    return this.delegate.findUnique(args);
  }

  findMany(
    args?: Prisma.TenantFindManyArgs,
  ): Promise<Prisma.TenantGetPayload<Prisma.TenantFindManyArgs>[]> {
    return this.delegate.findMany(args);
  }

  update(
    args: Prisma.TenantUpdateArgs,
  ): Promise<Prisma.TenantGetPayload<Prisma.TenantUpdateArgs>> {
    return this.delegate.update(args);
  }

  updateMany(args: Prisma.TenantUpdateManyArgs): Promise<Prisma.BatchPayload> {
    return this.delegate.updateMany(args);
  }

  upsert(
    args: Prisma.TenantUpsertArgs,
  ): Promise<Prisma.TenantGetPayload<Prisma.TenantUpsertArgs>> {
    return this.delegate.upsert(args);
  }

  delete(
    args: Prisma.TenantDeleteArgs,
  ): Promise<Prisma.TenantGetPayload<Prisma.TenantDeleteArgs>> {
    return this.delegate.delete(args);
  }

  deleteMany(args?: Prisma.TenantDeleteManyArgs): Promise<Prisma.BatchPayload> {
    return this.delegate.deleteMany(args);
  }

  count(args?: Prisma.TenantCountArgs): Promise<number> {
    return this.delegate.count(args);
  }

  aggregate(
    args: Prisma.TenantAggregateArgs,
  ): Promise<Prisma.GetTenantAggregateType<Prisma.TenantAggregateArgs>> {
    return this.delegate.aggregate(args);
  }
}
