"use client";

import { useEffect, useRef } from "react";
import { trpc } from "@repo/trpc/client";
import { useAuthClient } from "../lib/auth/auth-client";
import { useI18n } from "../hooks/useI18n";

export function TenantGate({ children }: { children: React.ReactNode }) {
  const { LL } = useI18n();
  const authClient = useAuthClient();
  const sessionResult = authClient?.useSession?.();
  const session = sessionResult?.data;
  const isAuthenticated = !!session?.user;

  const utils = trpc.useUtils();
  const myTenants = trpc.tenant.myTenants.useQuery(undefined, {
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: isAuthenticated,
  });
  const isSuperAdminQuery = trpc.tenant.isSuperAdmin.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const switchTenant = trpc.tenant.switchTenant.useMutation({
    onSuccess: () => {
      void utils.tenant.myTenants.invalidate();
    },
  });

  const autoSelectAttempted = useRef(false);

  const data = myTenants.data as
    | {
        tenants?: Array<{
          id: string;
          name: string;
          slug: string;
          role: string;
        }>;
        selectedTenantId?: string | null;
      }
    | undefined;

  const isSuperAdmin = (
    isSuperAdminQuery.data as { isSuperAdmin?: boolean } | undefined
  )?.isSuperAdmin;

  const tenants = data?.tenants ?? [];
  const selectedTenantId = data?.selectedTenantId ?? null;

  useEffect(() => {
    if (
      !autoSelectAttempted.current &&
      tenants.length > 0 &&
      !selectedTenantId &&
      !switchTenant.isPending
    ) {
      autoSelectAttempted.current = true;
      switchTenant.mutate({ tenantId: tenants[0]!.id });
    }
  }, [tenants, selectedTenantId, switchTenant]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (myTenants.isLoading || isSuperAdminQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-b-blue-400 border-transparent"
            aria-hidden
          />
          <p className="mt-4 text-slate-400 text-sm">{LL.Errors.loadingYourTenants()}</p>
        </div>
      </div>
    );
  }

  if (tenants.length === 0 && isSuperAdmin) {
    return <>{children}</>;
  }

  if (tenants.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-slate-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            {LL.Errors.noTenantsAssigned()}
          </h1>
          <p className="text-slate-400">
            {LL.Errors.noTenantsMessage()}
          </p>
        </div>
      </div>
    );
  }

  if (!selectedTenantId && switchTenant.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-b-blue-400 border-transparent"
            aria-hidden
          />
          <p className="mt-4 text-slate-400 text-sm">
            {LL.Errors.settingUpTenant()}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
