import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Tenant } from '@repo/prisma-db';
import { TENANT_CLS_KEYS } from '../../constants/tenant.constants';

/**
 * Request-scoped tenant context backed by CLS. Services and repositories use this to get the
 * current tenant without caring how it was resolved. The tenant is set by
 * TenantResolutionMiddleware (tRPC) from the user's persisted selectedTenantId.
 */
@Injectable()
export class TenantContext {
  constructor(private readonly cls: ClsService) {}

  getTenantId(): string | null {
    return this.cls.get<string | null>(TENANT_CLS_KEYS.TENANT_ID) ?? null;
  }

  getTenant(): Tenant | null {
    return this.cls.get<Tenant | null>(TENANT_CLS_KEYS.TENANT) ?? null;
  }

  setTenant(tenant: Tenant | null): void {
    this.cls.set(TENANT_CLS_KEYS.TENANT_ID, tenant?.id ?? null);
    this.cls.set(TENANT_CLS_KEYS.TENANT, tenant);
  }

  /** True when a tenant was explicitly resolved for this request. */
  hasTenant(): boolean {
    return this.getTenantId() != null;
  }
}
