import { AsyncLocalStorage } from 'node:async_hooks';

type TenantStore = { tenantId: string | null };

/**
 * Request-scoped tenant id for the Prisma extension. Uses AsyncLocalStorage so the value
 * is available even when @Transactional runs the transaction callback in a different
 * async boundary where CLS might not propagate. The request must be run inside
 * runWithTenantId() and the store's tenantId set after resolution (see setRequestTenantId).
 */
const tenantStorage = new AsyncLocalStorage<TenantStore>();

/**
 * Run the rest of the request inside a store so getTenantIdForExtension() works.
 * Use the async overload so the store stays active until the returned promise settles
 * (e.g. until response finishes), keeping tenantId available for @Transactional.
 */
export function runWithTenantStore<T>(store: TenantStore, fn: () => T): T;
export function runWithTenantStore<T>(
  store: TenantStore,
  fn: () => Promise<T>,
): Promise<T>;
export function runWithTenantStore<T>(
  store: TenantStore,
  fn: () => T | Promise<T>,
): T | Promise<T> {
  return tenantStorage.run(store, fn);
}

/**
 * Set the current request's tenant id (call after tenant resolution, inside runWithTenantStore).
 * The Prisma tenant extension reads this so tenant-scoped queries get the correct tenantId
 * even when running inside @Transactional.
 */
export function setRequestTenantId(tenantId: string | null): void {
  const store = tenantStorage.getStore();
  if (store) store.tenantId = tenantId;
}

/**
 * Used by the Prisma tenant extension to get the current request's tenant id.
 * Returns null if not inside runWithTenantStore or before setRequestTenantId.
 */
export function getTenantIdForExtension(): string | null {
  return tenantStorage.getStore()?.tenantId ?? null;
}
