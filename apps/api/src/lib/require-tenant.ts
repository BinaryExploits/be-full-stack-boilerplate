import { TENANT_REQUIRED_MESSAGE } from '../constants/tenant.constants';

/**
 * Returns the tenant id or throws a 403 error. Use in tenant-scoped repositories
 * before any Prisma call that requires a tenant.
 */
export function requireTenantId(tenantId: string | null): string {
  if (tenantId == null) {
    const err = new Error(TENANT_REQUIRED_MESSAGE) as Error & {
      statusCode?: number;
    };
    err.statusCode = 403;
    throw err;
  }
  return tenantId;
}
