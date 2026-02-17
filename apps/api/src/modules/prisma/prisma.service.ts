/* eslint-disable custom/require-transactional */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@repo/prisma-db';
import { createPrismaTenantExtension } from './prisma-tenant.extension';
import { TenantContext } from '../tenant/tenant.context';

/**
 * Wraps the Prisma client extended with tenant scoping. Tenant id is read from
 * TenantContext (CLS) at query time so Crud operations are scoped to the current request's tenant.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /** Extended client (tenant scoping on Crud). All property access is forwarded here. */
  readonly client: PrismaClient;

  constructor(private readonly tenantContext: TenantContext) {
    super();
    this.client = new PrismaClient().$extends(
      createPrismaTenantExtension(() => this.tenantContext.getTenantId()),
    ) as unknown as PrismaClient;
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}

/**
 * Proxy that forwards property access to the extended client so PrismaService can be
 * used as a drop-in PrismaClient (e.g. prisma.crud, prisma.$transaction).
 * Applied in PrismaModule so injected PrismaService behaves like the client.
 */
export function createPrismaServiceProxy(
  service: PrismaService,
): PrismaService {
  return new Proxy(service, {
    get(target, prop: string | symbol): unknown {
      if (prop === 'client') return target.client as unknown;
      if (prop === 'onModuleInit')
        return target.onModuleInit.bind(target) as unknown;
      if (prop === 'onModuleDestroy')
        return target.onModuleDestroy.bind(target) as unknown;
      const client = target.client as unknown as Record<
        string | symbol,
        unknown
      >;
      const value = client[prop];
      return (
        typeof value === 'function' ? value.bind(target.client) : value
      ) as unknown;
    },
  });
}
