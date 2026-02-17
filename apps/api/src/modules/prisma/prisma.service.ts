/* eslint-disable custom/require-transactional */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@repo/prisma-db';
import { ClsService } from 'nestjs-cls';
import { TENANT_CLS_KEYS } from '../../constants/tenant.constants';
import { prismaTenantExtension } from './prisma-tenant.extension';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly cls: ClsService) {
    super();

    const getTenantId = () =>
      this.cls.get<string | null>(TENANT_CLS_KEYS.TENANT_ID) ?? null;

    const ext = this.$extends(
      prismaTenantExtension(getTenantId),
    ) as unknown as PrismaClient;

    (this as Record<string, unknown>).crud = ext.crud;
    (this as Record<string, unknown>).globalCrud = ext.globalCrud;
    (this as Record<string, unknown>).tenant = ext.tenant;
    (this as Record<string, unknown>).user = ext.user;
    (this as Record<string, unknown>).session = ext.session;
    (this as Record<string, unknown>).account = ext.account;
    (this as Record<string, unknown>).verification = ext.verification;
    (this as Record<string, unknown>).$transaction = ext.$transaction.bind(ext);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
