import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { TENANT_CLS_KEYS } from '../../constants/tenant.constants';

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  allowedOrigins: string[];
}

/**
 * Request-scoped tenant context. Services and repositories use this to get the current tenant
 * without caring how it was resolved. When no tenant is set (resolution failed or no origin),
 * getTenantId() returns null; tenant-scoped repos do not add a tenant filter (no tenant = no tenant-scoped data).
 */
@Injectable()
export class TenantContext {
  constructor(private readonly cls: ClsService) {}

  getTenantId(): string | null {
    return this.cls.get<string | null>(TENANT_CLS_KEYS.TENANT_ID) ?? null;
  }

  getTenant(): TenantInfo | null {
    return this.cls.get<TenantInfo | null>(TENANT_CLS_KEYS.TENANT) ?? null;
  }

  setTenant(tenant: TenantInfo | null): void {
    this.cls.set(TENANT_CLS_KEYS.TENANT_ID, tenant?.id ?? null);
    this.cls.set(TENANT_CLS_KEYS.TENANT, tenant);
  }

  /** True when a tenant was explicitly resolved (by origin/host). */
  hasTenant(): boolean {
    return this.getTenantId() != null;
  }
}
