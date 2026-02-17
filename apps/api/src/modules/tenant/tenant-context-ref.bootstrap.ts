import { Injectable, OnModuleInit } from '@nestjs/common';
import { setTenantContextRef } from '../prisma/tenant-context-ref';
import { TenantContext } from './tenant.context';

/**
 * Sets the TenantContext ref so the Prisma tenant extension can read the current tenant
 * from CLS at query time. Must run when TenantModule is loaded (before any Crud queries).
 */
@Injectable()
export class TenantContextRefBootstrap implements OnModuleInit {
  constructor(private readonly tenantContext: TenantContext) {}

  onModuleInit(): void {
    setTenantContextRef(this.tenantContext);
  }
}
