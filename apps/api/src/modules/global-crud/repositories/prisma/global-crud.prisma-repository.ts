import { Injectable } from '@nestjs/common';
import {
  TransactionHost,
  InjectTransactionHost,
} from '@nestjs-cls/transactional';
import { Prisma } from '@repo/prisma-db';
import { IGlobalCrudPrismaRepository } from './global-crud.prisma-repository.interface';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';
import { ServerConstants } from '../../../../constants/server.constants';

@Injectable()
export class GlobalCrudPrismaRepository implements IGlobalCrudPrismaRepository {
  constructor(
    @InjectTransactionHost(ServerConstants.TransactionConnectionNames.Prisma)
    protected readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
  ) {}

  protected get delegate(): Prisma.GlobalCrudDelegate {
    return this.prismaTxHost.tx.globalCrud as Prisma.GlobalCrudDelegate;
  }

  create(
    args: Prisma.GlobalCrudCreateArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudCreateArgs>> {
    return this.delegate.create(args);
  }

  findUnique(
    args: Prisma.GlobalCrudFindUniqueArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudFindUniqueArgs> | null> {
    return this.delegate.findUnique(args);
  }

  findMany(
    args?: Prisma.GlobalCrudFindManyArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudFindManyArgs>[]> {
    return this.delegate.findMany(args);
  }

  update(
    args: Prisma.GlobalCrudUpdateArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudUpdateArgs>> {
    return this.delegate.update(args);
  }

  delete(
    args: Prisma.GlobalCrudDeleteArgs,
  ): Promise<Prisma.GlobalCrudGetPayload<Prisma.GlobalCrudDeleteArgs>> {
    return this.delegate.delete(args);
  }
}
