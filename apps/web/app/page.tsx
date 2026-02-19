"use client";

import Link from "next/link";
import { TenantDashboardOnly } from "./components/tenant-dashboard-only";
import { TenantAdminOnly } from "./components/tenant-admin-only";
import { useI18n } from "./hooks/useI18n";

export default function Home() {
  const { LL } = useI18n();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
              <span className="text-slate-900 font-bold text-2xl">BE</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {LL.Home.title()}
            </h1>
          </div>
          <p className="text-slate-400 text-lg">{LL.Home.subtitle()}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/crud-demo">
            <div className="group bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7h16M4 12h16M4 17h16"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {LL.Home.crudDemoTitle()}
                </h2>
              </div>
              <p className="text-slate-400 mb-6">
                {LL.Home.crudDemoDescription()}
              </p>
              <div className="flex items-center text-blue-400 font-medium group-hover:gap-3 gap-2 transition-all">
                <span>{LL.Home.tryItOut()}</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/global-crud-demo">
            <div className="group bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-amber-500 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {LL.Home.globalCrudDemoTitle()}
                </h2>
              </div>
              <p className="text-slate-400 mb-6">
                {LL.Home.globalCrudDemoDescription()}
              </p>
              <div className="flex items-center text-amber-400 font-medium group-hover:gap-3 gap-2 transition-all">
                <span>{LL.Home.tryItOut()}</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>

          <TenantDashboardOnly>
            <Link href="/tenant-dashboard">
              <div className="group bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-amber-500 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-8 h-8 text-white"
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
                  <h2 className="text-2xl font-bold text-white">
                    {LL.Home.platformTenantsTitle()}
                  </h2>
                </div>
                <p className="text-slate-400 mb-6">
                  {LL.Home.platformTenantsDescription()}
                </p>
                <div className="flex items-center text-amber-400 font-medium group-hover:gap-3 gap-2 transition-all">
                  <span>{LL.Home.manageTenants()}</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </TenantDashboardOnly>

          <TenantAdminOnly>
            <Link href="/tenant-members">
              <div className="group bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-cyan-500 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-8 h-8 text-white"
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
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {LL.Home.manageMembersTitle()}
                  </h2>
                </div>
                <p className="text-slate-400 mb-6">
                  {LL.Home.manageMembersDescription()}
                </p>
                <div className="flex items-center text-cyan-400 font-medium group-hover:gap-3 gap-2 transition-all">
                  <span>{LL.Home.manageMembers()}</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </TenantAdminOnly>

          <Link href="/auth-demo">
            <div className="group bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-green-500 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {LL.Home.authDemoTitle()}
                </h2>
              </div>
              <p className="text-slate-400 mb-6">
                {LL.Home.authDemoDescription()}
              </p>
              <div className="flex items-center text-green-400 font-medium group-hover:gap-3 gap-2 transition-all">
                <span>{LL.Home.tryItOut()}</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">{LL.Home.footer()}</p>
        </div>
      </div>
    </main>
  );
}
