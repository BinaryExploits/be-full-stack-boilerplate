"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@repo/trpc/client";
import { useI18n } from "../hooks/useI18n";

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export function TenantSwitcher() {
  const { LL } = useI18n();
  const utils = trpc.useUtils();
  const myTenants = trpc.tenant.myTenants.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const switchTenant = trpc.tenant.switchTenant.useMutation({
    onSuccess: () => {
      void utils.invalidate();
    },
  });

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const data = myTenants.data as
    | {
        tenants?: TenantInfo[];
        selectedTenantId?: string | null;
        singleTenantMode?: boolean;
      }
    | undefined;

  const tenants = data?.tenants ?? [];
  const selectedTenantId = data?.selectedTenantId ?? null;
  const currentTenant = tenants.find((t) => t.id === selectedTenantId);

  if (tenants.length === 0 || data?.singleTenantMode) return null;

  const handleSwitch = (tenantId: string) => {
    if (tenantId === selectedTenantId) {
      setOpen(false);
      return;
    }
    switchTenant.mutate({ tenantId });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={switchTenant.isPending}
        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white transition-colors"
      >
        <svg
          className="w-4 h-4 text-slate-400"
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
        <span className="max-w-[140px] truncate">
          {switchTenant.isPending
            ? LL.Navigation.switching()
            : (currentTenant?.name ?? LL.Navigation.selectTenant())}
        </span>
        <svg
          className={`w-3 h-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {LL.Navigation.switchTenant()}
            </p>
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {tenants.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => handleSwitch(t.id)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                    t.id === selectedTenantId
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{t.name}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      {t.slug}
                    </div>
                  </div>
                  <span className="shrink-0 ml-2 text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                    {t.role === "TENANT_ADMIN"
                      ? LL.Common.roleAdmin()
                      : LL.Common.roleUser()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
