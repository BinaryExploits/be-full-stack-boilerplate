/**
 * CLS keys for multi-tenant context. Resolved once per request in TenantResolutionMiddleware.
 */
export const TENANT_CLS_KEYS = {
  TENANT_ID: 'tenantId',
  TENANT: 'tenant',
} as const;

export type TenantClsKey = (typeof TENANT_CLS_KEYS)[keyof typeof TENANT_CLS_KEYS];
