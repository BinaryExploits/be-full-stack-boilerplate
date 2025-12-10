import { TransactionHost } from '@nestjs-cls/transactional';
import { Prisma } from '@repo/prisma-db';
import { CrudRepositoryInterface } from './crud.repository.interface';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';

export abstract class CrudRepositoryAbstract
  implements CrudRepositoryInterface
{
  protected readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>;

  protected constructor(
    prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
  ) {
    this.prismaTxHost = prismaTxHost;
  }

  protected get delegate() {
    return this.prismaTxHost.tx.crud;
  }

  create(args: Prisma.CrudCreateArgs) {
    return this.delegate.create(args);
  }

  createMany(args: Prisma.CrudCreateManyArgs) {
    return this.delegate.createMany(args);
  }

  findFirst(args?: Prisma.CrudFindFirstArgs) {
    return this.delegate.findFirst(args);
  }

  findFirstOrThrow(args?: Prisma.CrudFindFirstArgs) {
    return this.delegate.findFirstOrThrow(args);
  }

  findUnique(args: Prisma.CrudFindUniqueArgs) {
    return this.delegate.findUnique(args);
  }

  findUniqueOrThrow(args: Prisma.CrudFindUniqueArgs) {
    return this.delegate.findUniqueOrThrow(args);
  }

  findMany(args?: Prisma.CrudFindManyArgs) {
    return this.delegate.findMany(args);
  }

  update(args: Prisma.CrudUpdateArgs) {
    return this.delegate.update(args);
  }

  updateMany(args: Prisma.CrudUpdateManyArgs) {
    return this.delegate.updateMany(args);
  }

  upsert(args: Prisma.CrudUpsertArgs) {
    return this.delegate.upsert(args);
  }

  delete(args: Prisma.CrudDeleteArgs) {
    return this.delegate.delete(args);
  }

  deleteMany(args?: Prisma.CrudDeleteManyArgs) {
    return this.delegate.deleteMany(args);
  }

  count(args?: Prisma.CrudCountArgs) {
    return this.delegate.count(args);
  }

  aggregate(args: Prisma.CrudAggregateArgs) {
    return this.delegate.aggregate(args);
  }
}
