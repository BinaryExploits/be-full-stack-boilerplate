/**
 * CLS keys for multi-tenant context. Resolved once per request in TenantMiddleware.
 */
export const TENANT_CLS_KEYS = {
  TENANT_ID: 'tenantId',
  TENANT: 'tenant',
} as const;

export type TenantClsKey =
  (typeof TENANT_CLS_KEYS)[keyof typeof TENANT_CLS_KEYS];

/** Message thrown when tenant-scoped data is accessed without a resolved tenant. */
export const TENANT_REQUIRED_MESSAGE =
  'Tenant not resolved. The user must select a tenant before accessing tenant-scoped data.';
