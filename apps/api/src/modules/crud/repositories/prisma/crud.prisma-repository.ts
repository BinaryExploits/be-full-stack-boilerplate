import { Injectable } from '@nestjs/common';
import {
  TransactionHost,
  InjectTransactionHost,
} from '@nestjs-cls/transactional';
import { Prisma } from '@repo/prisma-db';
import { ICrudPrismaRepository } from './crud.prisma-repository.interface';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';
import { ServerConstants } from '../../../../constants/server.constants';
import { TenantContext } from '../../../tenant/tenant.context';
import { requireTenantId } from '../../../../lib/require-tenant';

function mergeWhere<T extends { where?: Prisma.CrudWhereInput } | undefined>(
  args: T,
  tenantId: string,
): T {
  const baseWhere: Prisma.CrudWhereInput = { tenantId };
  if (args == null) {
    return { where: baseWhere } as T;
  }
  return {
    ...args,
    where: { ...args.where, tenantId } as Prisma.CrudWhereInput,
  } as T;
}

@Injectable()
export class CrudPrismaRepository implements ICrudPrismaRepository {
  constructor(
    @InjectTransactionHost(ServerConstants.TransactionConnectionNames.Prisma)
    protected readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
    private readonly tenantContext: TenantContext,
  ) {}

  protected get delegate(): Prisma.CrudDelegate {
    return this.prismaTxHost.tx.crud;
  }

  create(
    args: Prisma.CrudCreateArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudCreateArgs>> {
    const tenantId = requireTenantId(this.tenantContext.getTenantId());
    const data = {
      ...args.data,
      tenantId,
    } as unknown as Prisma.CrudCreateInput;
    return this.delegate.create({ ...args, data });
  }

  createMany(args: Prisma.CrudCreateManyArgs): Promise<Prisma.BatchPayload> {
    const tenantId = requireTenantId(this.tenantContext.getTenantId());
    const data = Array.isArray(args.data)
      ? args.data.map((row) => ({ ...row, tenantId }))
      : { ...args.data, tenantId };
    return this.delegate.createMany({
      ...args,
      data,
    } as Prisma.CrudCreateManyArgs);
  }

  findFirst(
    args?: Prisma.CrudFindFirstArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudFindFirstArgs> | null> {
    const tenantId = requireTenantId(this.tenantContext.getTenantId());
    return this.delegate.findFirst(mergeWhere(args, tenantId));
  }

  findUnique(
    args: Prisma.CrudFindUniqueArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudFindUniqueArgs> | null> {
    const tenantId = requireTenantId(this.tenantContext.getTenantId());
    return this.delegate.findUnique(mergeWhere(args, tenantId));
  }

  findMany(
    args?: Prisma.CrudFindManyArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudFindManyArgs>[]> {
    const tenantId = requireTenantId(this.tenantContext.getTenantId());
    return this.delegate.findMany(mergeWhere(args, tenantId));
  }

  update(
    args: Prisma.CrudUpdateArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudUpdateArgs>> {
    const tenantId = requireTenantId(this.tenantContext.getTenantId());
    return this.delegate.update(mergeWhere(args, tenantId));
  }

  updateMany(args: Prisma.CrudUpdateManyArgs): Promise<Prisma.BatchPayload> {
    const tenantId = requireTenantId(this.tenantContext.getTenantId());
    return this.delegate.updateMany(mergeWhere(args, tenantId));
  }

  upsert(
    args: Prisma.CrudUpsertArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudUpsertArgs>> {
    const tenantId = requireTenantId(this.tenantContext.getTenantId());
    const where = { ...args.where, tenantId } as Prisma.CrudWhereUniqueInput;
    const create = {
      ...args.create,
      tenantId,
    } as unknown as Prisma.CrudCreateInput;
    const update = {
      ...args.update,
      tenantId,
    } as unknown as Prisma.CrudUpdateInput;
    return this.delegate.upsert({ ...args, where, create, update });
  }

  delete(
    args: Prisma.CrudDeleteArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudDeleteArgs>> {
    const tenantId = requireTenantId(this.tenantContext.getTenantId());
    return this.delegate.delete(mergeWhere(args, tenantId));
  }

  deleteMany(args?: Prisma.CrudDeleteManyArgs): Promise<Prisma.BatchPayload> {
    const tenantId = requireTenantId(this.tenantContext.getTenantId());
    return this.delegate.deleteMany(mergeWhere(args, tenantId));
  }

  count(args?: Prisma.CrudCountArgs): Promise<number> {
    const tenantId = requireTenantId(this.tenantContext.getTenantId());
    return this.delegate.count(mergeWhere(args, tenantId));
  }

  aggregate(
    args: Prisma.CrudAggregateArgs,
  ): Promise<Prisma.GetCrudAggregateType<Prisma.CrudAggregateArgs>> {
    const tenantId = requireTenantId(this.tenantContext.getTenantId());
    return this.delegate.aggregate(mergeWhere(args, tenantId));
  }
}
