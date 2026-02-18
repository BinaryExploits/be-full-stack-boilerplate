/**
 * @deprecated Express-level TenantMiddleware is no longer used.
 * Tenant resolution is now done via TenantResolutionMiddleware (tRPC middleware)
 * which runs after auth and reads selectedTenantId from the user's DB profile.
 * This file is kept as a tombstone — safe to delete.
 */
