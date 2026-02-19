"use client";

import { useState } from "react";
import { trpc } from "@repo/trpc/client";
import Link from "next/link";
import { useAuthClient } from "../lib/auth/auth-client";
import { useI18n } from "../hooks/useI18n";

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface MemberItem {
  id: string;
  email: string;
  tenantId: string;
  role: string;
}

export default function TenantMembers() {
  const { LL } = useI18n();
  const authClient = useAuthClient();
  const sessionResult = authClient?.useSession?.();
  const session = sessionResult?.data;

  const utils = trpc.useUtils();
  const myTenantsQuery = trpc.tenant.myTenants.useQuery(undefined, {
    enabled: !!session?.user,
    refetchOnWindowFocus: false,
  });
  const isSuperAdminQuery = trpc.tenant.isSuperAdmin.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<
    "TENANT_ADMIN" | "TENANT_USER"
  >("TENANT_USER");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const membersQuery = trpc.tenant.listMembers.useQuery(
    { tenantId: selectedTenantId ?? "" },
    { enabled: !!selectedTenantId, refetchOnWindowFocus: false },
  );

  const addMember = trpc.tenant.addMember.useMutation({
    onSuccess: () => {
      void utils.tenant.listMembers.invalidate({
        tenantId: selectedTenantId ?? "",
      });
      setNewMemberEmail("");
      setErrorMessage(null);
    },
    onError: (err) => setErrorMessage(err.message),
  });

  const removeMember = trpc.tenant.removeMember.useMutation({
    onSuccess: () => {
      void utils.tenant.listMembers.invalidate({
        tenantId: selectedTenantId ?? "",
      });
      setErrorMessage(null);
    },
    onError: (err) => setErrorMessage(err.message),
  });

  const isSuperAdmin = (
    isSuperAdminQuery.data as { isSuperAdmin?: boolean } | undefined
  )?.isSuperAdmin;

  const allTenants: TenantInfo[] =
    (myTenantsQuery.data as { tenants?: TenantInfo[] } | undefined)?.tenants ??
    [];

  const adminTenants = isSuperAdmin
    ? allTenants
    : allTenants.filter((t) => t.role === "TENANT_ADMIN");

  const selectedTenant = adminTenants.find((t) => t.id === selectedTenantId);

  const members: MemberItem[] =
    (membersQuery.data as { members?: MemberItem[] } | undefined)?.members ??
    [];

  const handleAddMember = () => {
    if (!selectedTenantId || !newMemberEmail.trim()) return;
    setErrorMessage(null);
    addMember.mutate({
      email: newMemberEmail.trim().toLowerCase(),
      tenantId: selectedTenantId,
      role: newMemberRole,
    });
  };

  const currentUserEmail = session?.user?.email?.toLowerCase() ?? "";

  const handleRemoveMember = (email: string) => {
    if (!selectedTenantId) return;
    removeMember.mutate({ email, tenantId: selectedTenantId });
  };

  const isLoading = myTenantsQuery.isLoading || isSuperAdminQuery.isLoading;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-b-blue-400 border-transparent"
            aria-hidden
          />
          <p className="mt-4 text-slate-400 text-sm">{LL.Common.loading()}</p>
        </div>
      </main>
    );
  }

  if (adminTenants.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-md mx-auto mt-24 bg-slate-800 border border-slate-700 rounded-xl p-10 text-center">
          <h1 className="text-2xl font-bold text-white mb-3">
            {LL.Settings.noAdminAccess()}
          </h1>
          <p className="text-slate-400 mb-6">
            {LL.Settings.noAdminAccessMessage()}
          </p>
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            {LL.Common.backToHome()}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {LL.Common.backToHome()}
        </Link>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
            {LL.Settings.manageMembersTitle()}
          </h1>
          <p className="text-slate-400 text-lg">
            {LL.Settings.manageMembersSubtitle()}
          </p>
        </div>

        {(errorMessage ||
          addMember.error?.message ||
          removeMember.error?.message) && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-200">
            {errorMessage ||
              addMember.error?.message ||
              removeMember.error?.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: tenant list (name only) */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 border border-slate-600 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-700 border-b border-slate-600">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  {LL.Settings.yourTenants({ count: adminTenants.length })}
                </p>
              </div>
              <ul className="divide-y divide-slate-700">
                {adminTenants.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() =>
                        setSelectedTenantId(
                          selectedTenantId === t.id ? null : t.id,
                        )
                      }
                      className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between ${
                        selectedTenantId === t.id
                          ? "bg-blue-500/10 text-blue-400 border-l-2 border-l-blue-500"
                          : "text-slate-300 hover:bg-slate-700/50"
                      }`}
                    >
                      <span className="font-medium truncate">{t.name}</span>
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
          </div>

          {/* Right: member management */}
          <div className="lg:col-span-3">
            {selectedTenantId && selectedTenant ? (
              <div className="bg-slate-800 border border-slate-600 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">
                    {LL.Settings.membersOf({ name: selectedTenant.name })}
                  </h2>
                </div>

                {/* Add member form */}
                <div className="space-y-3 mb-6 p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    {LL.Settings.addMember()}
                  </p>
                  <input
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={LL.Settings.memberEmailPlaceholder()}
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <select
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newMemberRole}
                      onChange={(e) =>
                        setNewMemberRole(
                          e.target.value as "TENANT_ADMIN" | "TENANT_USER",
                        )
                      }
                    >
                      <option value="TENANT_USER">
                        {LL.Common.roleUser()}
                      </option>
                      <option value="TENANT_ADMIN">
                        {LL.Common.roleAdmin()}
                      </option>
                    </select>
                    <button
                      onClick={handleAddMember}
                      disabled={addMember.isPending || !newMemberEmail.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      {addMember.isPending
                        ? LL.Common.adding()
                        : LL.Common.add()}
                    </button>
                  </div>
                </div>

                {/* Member list */}
                {membersQuery.isLoading ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    {LL.Settings.loadingMembers()}
                  </p>
                ) : members.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    {LL.Settings.noMembersYet()}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {members.map((m) => {
                      const isSelf = m.email.toLowerCase() === currentUserEmail;
                      return (
                        <li
                          key={m.id}
                          className="flex items-center justify-between bg-slate-700/50 rounded-lg px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate flex items-center gap-2">
                              {m.email}
                              {isSelf && (
                                <span className="text-[10px] font-semibold uppercase tracking-wide bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                                  {LL.Common.you()}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">
                              {m.role === "TENANT_ADMIN"
                                ? LL.Common.roleAdmin()
                                : LL.Common.roleUser()}
                            </p>
                          </div>
                          {!isSelf && (
                            <button
                              onClick={() => handleRemoveMember(m.email)}
                              disabled={removeMember.isPending}
                              className="shrink-0 ml-3 p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded transition-colors disabled:opacity-50"
                              title={LL.Settings.removeMember()}
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-xl p-12 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-slate-600 mb-4"
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
                <p className="text-slate-500">
                  {LL.Settings.selectTenantPrompt()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
