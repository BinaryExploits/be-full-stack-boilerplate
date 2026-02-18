import { Injectable } from '@nestjs/common';
import {
  TransactionHost,
  InjectTransactionHost,
} from '@nestjs-cls/transactional';
import { Prisma } from '@repo/prisma-db';
import { ITenantMembershipPrismaRepository } from './tenant-membership.prisma-repository.interface';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';
import { ServerConstants } from '../../../../constants/server.constants';

/**
 * Direct pass-through to Prisma with transactional support.
 * Unlike other tenant-scoped repositories, this does NOT auto-scope via CLS
 * because membership operations are performed from auth-only routes (myTenants,
 * switchTenant, TenantAdminGuard) where no tenant is resolved in CLS yet.
 * The calling service is responsible for providing the correct tenantId.
 */
@Injectable()
export class TenantMembershipPrismaRepository implements ITenantMembershipPrismaRepository {
  constructor(
    @InjectTransactionHost(ServerConstants.TransactionConnectionNames.Prisma)
    protected readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
  ) {}

  protected get delegate(): Prisma.TenantMembershipDelegate {
    return this.prismaTxHost.tx.tenantMembership;
  }

  create(
    args: Prisma.TenantMembershipCreateArgs,
  ): Promise<
    Prisma.TenantMembershipGetPayload<Prisma.TenantMembershipCreateArgs>
  > {
    return this.delegate.create(args);
  }

  createMany(
    args: Prisma.TenantMembershipCreateManyArgs,
  ): Promise<Prisma.BatchPayload> {
    return this.delegate.createMany(args);
  }

  findFirst(
    args?: Prisma.TenantMembershipFindFirstArgs,
  ): Promise<Prisma.TenantMembershipGetPayload<Prisma.TenantMembershipFindFirstArgs> | null> {
    return this.delegate.findFirst(args);
  }

  findUnique(
    args: Prisma.TenantMembershipFindUniqueArgs,
  ): Promise<Prisma.TenantMembershipGetPayload<Prisma.TenantMembershipFindUniqueArgs> | null> {
    return this.delegate.findUnique(args);
  }

  findMany(
    args?: Prisma.TenantMembershipFindManyArgs,
  ): Promise<
    Prisma.TenantMembershipGetPayload<Prisma.TenantMembershipFindManyArgs>[]
  > {
    return this.delegate.findMany(args);
  }

  update(
    args: Prisma.TenantMembershipUpdateArgs,
  ): Promise<
    Prisma.TenantMembershipGetPayload<Prisma.TenantMembershipUpdateArgs>
  > {
    return this.delegate.update(args);
  }

  updateMany(
    args: Prisma.TenantMembershipUpdateManyArgs,
  ): Promise<Prisma.BatchPayload> {
    return this.delegate.updateMany(args);
  }

  upsert(
    args: Prisma.TenantMembershipUpsertArgs,
  ): Promise<
    Prisma.TenantMembershipGetPayload<Prisma.TenantMembershipUpsertArgs>
  > {
    return this.delegate.upsert(args);
  }

  delete(
    args: Prisma.TenantMembershipDeleteArgs,
  ): Promise<
    Prisma.TenantMembershipGetPayload<Prisma.TenantMembershipDeleteArgs>
  > {
    return this.delegate.delete(args);
  }

  deleteMany(
    args?: Prisma.TenantMembershipDeleteManyArgs,
  ): Promise<Prisma.BatchPayload> {
    return this.delegate.deleteMany(args);
  }

  count(args?: Prisma.TenantMembershipCountArgs): Promise<number> {
    return this.delegate.count(args);
  }

  aggregate(
    args: Prisma.TenantMembershipAggregateArgs,
  ): Promise<
    Prisma.GetTenantMembershipAggregateType<Prisma.TenantMembershipAggregateArgs>
  > {
    return this.delegate.aggregate(args);
  }
}
