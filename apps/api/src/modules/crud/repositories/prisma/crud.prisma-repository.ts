import { Injectable } from '@nestjs/common';
import {
  TransactionHost,
  InjectTransactionHost,
} from '@nestjs-cls/transactional';
import { Prisma } from '@repo/prisma-db';
import { ICrudPrismaRepository } from './crud.prisma-repository.interface';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';
import { ServerConstants } from '../../../../constants/server.constants';

@Injectable()
export class CrudPrismaRepository implements ICrudPrismaRepository {
  constructor(
    @InjectTransactionHost(ServerConstants.TransactionConnectionNames.Prisma)
    protected readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
  ) {}

  protected get delegate(): Prisma.CrudDelegate {
    return this.prismaTxHost.tx.crud;
  }

  create(
    args: Prisma.CrudCreateArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudCreateArgs>> {
    return this.delegate.create(args);
  }

  createMany(args: Prisma.CrudCreateManyArgs): Promise<Prisma.BatchPayload> {
    return this.delegate.createMany(args);
  }

  findFirst(
    args?: Prisma.CrudFindFirstArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudFindFirstArgs> | null> {
    return this.delegate.findFirst(args);
  }

  findUnique(
    args: Prisma.CrudFindUniqueArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudFindUniqueArgs> | null> {
    return this.delegate.findUnique(args);
  }

  findMany(
    args?: Prisma.CrudFindManyArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudFindManyArgs>[]> {
    return this.delegate.findMany(args);
  }

  update(
    args: Prisma.CrudUpdateArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudUpdateArgs>> {
    return this.delegate.update(args);
  }

  updateMany(args: Prisma.CrudUpdateManyArgs): Promise<Prisma.BatchPayload> {
    return this.delegate.updateMany(args);
  }

  upsert(
    args: Prisma.CrudUpsertArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudUpsertArgs>> {
    return this.delegate.upsert(args);
  }

  delete(
    args: Prisma.CrudDeleteArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudDeleteArgs>> {
    return this.delegate.delete(args);
  }

  deleteMany(args?: Prisma.CrudDeleteManyArgs): Promise<Prisma.BatchPayload> {
    return this.delegate.deleteMany(args);
  }

  count(args?: Prisma.CrudCountArgs): Promise<number> {
    return this.delegate.count(args);
  }

  aggregate(
    args: Prisma.CrudAggregateArgs,
  ): Promise<Prisma.GetCrudAggregateType<Prisma.CrudAggregateArgs>> {
    return this.delegate.aggregate(args);
  }
}
