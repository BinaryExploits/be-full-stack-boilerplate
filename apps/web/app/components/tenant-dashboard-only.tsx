"use client";

import { trpc } from "@repo/trpc/client";
import { useAuthClient } from "../lib/auth/auth-client";

/**
 * Renders children only when the current user is a super-admin (in SUPER_ADMIN_EMAILS).
 * Use to show Tenant dashboard links/cards only to allowed users.
 */
export function TenantDashboardOnly({
  children,
}: {
  children: React.ReactNode;
}) {
  const authClient = useAuthClient();
  const sessionResult = authClient?.useSession?.();
  const session = sessionResult?.data;

  const { data } = trpc.tenant.isSuperAdmin.useQuery(undefined, {
    enabled: !!session?.user,
  });

  if (!data?.isSuperAdmin) return null;
  return <>{children}</>;
}
