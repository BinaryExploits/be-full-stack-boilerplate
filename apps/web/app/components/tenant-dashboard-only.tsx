"use client";

import { trpc } from "@repo/trpc/client";
import { useAuthClient } from "../lib/auth/auth-client";

/**
 * Renders children only when the current user is a super-admin (in SUPER_ADMIN_EMAILS)
 * AND the app is NOT in single-tenant mode.
 */
export function TenantDashboardOnly({
  children,
}: {
  children: React.ReactNode;
}) {
  const authClient = useAuthClient();
  const sessionResult = authClient?.useSession?.();
  const session = sessionResult?.data;

  const query = trpc.tenant.isSuperAdmin.useQuery(undefined, {
    enabled: !!session?.user,
  });
  const myTenantsQuery = trpc.tenant.myTenants.useQuery(undefined, {
    enabled: !!session?.user,
    refetchOnWindowFocus: false,
  });

  const isSuperAdmin = (query.data as { isSuperAdmin?: boolean } | undefined)
    ?.isSuperAdmin;
  const singleTenantMode = (
    myTenantsQuery.data as { singleTenantMode?: boolean } | undefined
  )?.singleTenantMode;

  if (!isSuperAdmin || singleTenantMode) return null;
  return <>{children}</>;
}
