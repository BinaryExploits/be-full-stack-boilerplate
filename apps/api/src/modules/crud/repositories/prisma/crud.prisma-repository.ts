import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  TransactionHost,
  InjectTransactionHost,
} from '@nestjs-cls/transactional';
import { Prisma } from '@repo/prisma-db';
import { ICrudPrismaRepository } from './crud.prisma-repository.interface';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';
import { ServerConstants } from '../../../../constants/server.constants';
import { TenantContext } from '../../../tenant/tenant.context';

const TENANT_REQUIRED_MSG =
  'Tenant could not be resolved from request origin; tenant-scoped data is not available.';

@Injectable()
export class CrudPrismaRepository implements ICrudPrismaRepository {
  constructor(
    @InjectTransactionHost(ServerConstants.TransactionConnectionNames.Prisma)
    protected readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
    protected readonly tenantContext: TenantContext,
  ) {}

  protected get delegate(): Prisma.CrudDelegate {
    return this.prismaTxHost.tx.crud;
  }

  create(
    args: Prisma.CrudCreateArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudCreateArgs>> {
    return this.delegate.create(this.mergeData(args));
  }

  createMany(args: Prisma.CrudCreateManyArgs): Promise<Prisma.BatchPayload> {
    const tenantId = this.tenantContext.getTenantId();
    if (tenantId == null) throw new ForbiddenException(TENANT_REQUIRED_MSG);
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
    return this.delegate.findFirst(this.mergeWhere(args));
  }

  findUnique(
    args: Prisma.CrudFindUniqueArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudFindUniqueArgs> | null> {
    return this.delegate.findUnique(this.mergeWhere(args));
  }

  findMany(
    args?: Prisma.CrudFindManyArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudFindManyArgs>[]> {
    return this.delegate.findMany(this.mergeWhere(args));
  }

  update(
    args: Prisma.CrudUpdateArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudUpdateArgs>> {
    return this.delegate.update(this.mergeWhere(args));
  }

  updateMany(args: Prisma.CrudUpdateManyArgs): Promise<Prisma.BatchPayload> {
    return this.delegate.updateMany(this.mergeWhere(args));
  }

  upsert(
    args: Prisma.CrudUpsertArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudUpsertArgs>> {
    const tenantId = this.tenantContext.getTenantId();
    if (tenantId == null) throw new ForbiddenException(TENANT_REQUIRED_MSG);
    return this.delegate.upsert({
      ...args,
      where: { ...args.where, tenantId } as Prisma.CrudWhereUniqueInput,
      create: { ...args.create, tenantId } as unknown as Prisma.CrudCreateInput,
      update: { ...args.update, tenantId } as unknown as Prisma.CrudUpdateInput,
    });
  }

  delete(
    args: Prisma.CrudDeleteArgs,
  ): Promise<Prisma.CrudGetPayload<Prisma.CrudDeleteArgs>> {
    return this.delegate.delete(this.mergeWhere(args));
  }

  deleteMany(args?: Prisma.CrudDeleteManyArgs): Promise<Prisma.BatchPayload> {
    return this.delegate.deleteMany(this.mergeWhere(args));
  }

  count(args?: Prisma.CrudCountArgs): Promise<number> {
    return this.delegate.count(this.mergeWhere(args));
  }

  aggregate(
    args: Prisma.CrudAggregateArgs,
  ): Promise<Prisma.GetCrudAggregateType<Prisma.CrudAggregateArgs>> {
    return this.delegate.aggregate(this.mergeWhere(args));
  }

  /**
   * Merge tenantId into where. When no tenant is resolved we reject (no data exposed).
   */
  private mergeWhere<T extends { where?: Prisma.CrudWhereInput } | undefined>(
    args: T,
  ): T {
    const tenantId = this.tenantContext.getTenantId();
    if (tenantId == null) throw new ForbiddenException(TENANT_REQUIRED_MSG);
    const baseWhere: Prisma.CrudWhereInput = { tenantId };
    if (args == null) {
      return { where: baseWhere } as T;
    }
    return {
      ...args,
      where: { ...args.where, ...baseWhere } as Prisma.CrudWhereInput,
    } as T;
  }

  /** Merge tenantId into create data; reject when no tenant resolved. */
  private mergeData<T extends { data: Prisma.CrudCreateInput }>(args: T): T {
    const tenantId = this.tenantContext.getTenantId();
    if (tenantId == null) throw new ForbiddenException(TENANT_REQUIRED_MSG);
    return {
      ...args,
      data: { ...args.data, tenantId } as Prisma.CrudCreateInput,
    };
  }
}
