/* eslint-disable custom/require-transactional */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@repo/prisma-db';

/**
 * Application Prisma client. Tenant scoping for tenant-scoped entities (Crud, etc.)
 * is done in their repositories via TenantContext, not in the client.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
