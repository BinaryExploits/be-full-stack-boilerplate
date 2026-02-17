import type { TenantContext } from '../tenant/tenant.context';

/**
 * Set at app init so the Prisma tenant extension can read the current tenant from CLS
 * without being tied to Nest DI. TenantContext.getTenantId() is request-scoped via CLS.
 */
let ref: TenantContext | null = null;

export function setTenantContextRef(context: TenantContext): void {
  ref = context;
}

export function getTenantContext(): TenantContext | null {
  return ref;
}

export function getTenantIdForExtension(): string | null {
  return ref?.getTenantId() ?? null;
}
