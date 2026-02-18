"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { trpc } from "@repo/trpc/client";
import { TenantSwitcher } from "./tenant-switcher";
import { useAuthClient } from "../lib/auth/auth-client";

export function NavHeader() {
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

  if (!session?.user) return null;

  const isSuperAdmin = (
    isSuperAdminQuery.data as { isSuperAdmin?: boolean } | undefined
  )?.isSuperAdmin;

  const myTenantsData = myTenantsQuery.data as
    | {
        tenants?: Array<{
          id: string;
          name: string;
          slug: string;
          role: string;
        }>;
        singleTenantMode?: boolean;
      }
    | undefined;

  const myTenants = myTenantsData?.tenants ?? [];
  const singleTenantMode = myTenantsData?.singleTenantMode ?? false;

  const hasAdminTenant =
    !singleTenantMode &&
    (isSuperAdmin || myTenants.some((t) => t.role === "TENANT_ADMIN"));

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-semibold"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
              <span className="text-slate-900 font-bold text-xs">BE</span>
            </div>
            <span className="hidden sm:inline text-sm">Full Stack</span>
          </Link>

          <div className="flex items-center gap-3">
            <TenantSwitcher />

            {/* User menu */}
            <div ref={ref} className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-800"
              >
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {session.user.name || session.user.email}
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
                <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-700">
                    <p className="text-sm font-medium text-white truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {session.user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    {isSuperAdmin && !singleTenantMode && (
                      <Link
                        href="/tenant-dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
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
                        Platform Tenants
                      </Link>
                    )}
                    {hasAdminTenant && (
                      <Link
                        href="/tenant-members"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Manage Members
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-700 py-1">
                    <button
                      onClick={() => {
                        setOpen(false);
                        void authClient?.signOut?.();
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-400 hover:bg-slate-700 hover:text-red-400 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
