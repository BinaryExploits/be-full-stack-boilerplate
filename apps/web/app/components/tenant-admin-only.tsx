"use client";

import { trpc } from "@repo/trpc/client";
import { useAuthClient } from "../lib/auth/auth-client";

/**
 * Renders children only when the current user is a tenant admin for at least
 * one tenant (or is a super admin) AND the app is NOT in single-tenant mode.
 */
export function TenantAdminOnly({ children }: { children: React.ReactNode }) {
  const authClient = useAuthClient();
  const sessionResult = authClient?.useSession?.();
  const session = sessionResult?.data;

  const isSuperAdminQuery = trpc.tenant.isSuperAdmin.useQuery(undefined, {
    enabled: !!session?.user,
  });
  const myTenantsQuery = trpc.tenant.myTenants.useQuery(undefined, {
    enabled: !!session?.user,
    refetchOnWindowFocus: false,
  });

  const isSuperAdmin = (
    isSuperAdminQuery.data as { isSuperAdmin?: boolean } | undefined
  )?.isSuperAdmin;

  const myTenantsData = myTenantsQuery.data as
    | { tenants?: Array<{ role: string }>; singleTenantMode?: boolean }
    | undefined;

  const tenants = myTenantsData?.tenants ?? [];
  const singleTenantMode = myTenantsData?.singleTenantMode ?? false;

  if (singleTenantMode) return null;

  const hasAdminAccess =
    isSuperAdmin || tenants.some((t) => t.role === "TENANT_ADMIN");

  if (!hasAdminAccess) return null;
  return <>{children}</>;
}
