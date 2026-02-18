"use client";

import { useState } from "react";
import { trpc } from "@repo/trpc/client";
import Link from "next/link";

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  allowedOrigins: string[];
}

interface MemberItem {
  id: string;
  email: string;
  tenantId: string;
  role: string;
}

function parseOriginsInput(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatOriginsForInput(origins: string[]): string {
  return origins.join("\n");
}

export default function TenantDashboard() {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [originsInput, setOriginsInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editOriginsInput, setEditOriginsInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [managingMembersId, setManagingMembersId] = useState<string | null>(
    null,
  );
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<
    "TENANT_ADMIN" | "TENANT_USER"
  >("TENANT_USER");

  const tenantList = trpc.tenant.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const tenants: TenantItem[] =
    (tenantList.data as { tenants?: TenantItem[] } | undefined)?.tenants ?? [];

  const membersQuery = trpc.tenant.listMembers.useQuery(
    { tenantId: managingMembersId ?? "" },
    {
      enabled: !!managingMembersId,
      refetchOnWindowFocus: false,
    },
  );
  const members: MemberItem[] =
    (membersQuery.data as { members?: MemberItem[] } | undefined)?.members ??
    [];

  const createTenant = trpc.tenant.create.useMutation({
    onSuccess: () => {
      void utils.tenant.findAll.invalidate();
      setName("");
      setSlug("");
      setOriginsInput("");
      setErrorMessage(null);
    },
    onError: (err) => setErrorMessage(err.message),
  });

  const updateTenant = trpc.tenant.update.useMutation({
    onSuccess: () => {
      void utils.tenant.findAll.invalidate();
      setEditingId(null);
      setErrorMessage(null);
    },
    onError: (err) => setErrorMessage(err.message),
  });

  const deleteTenant = trpc.tenant.delete.useMutation({
    onSuccess: () => {
      void utils.tenant.findAll.invalidate();
      if (managingMembersId) setManagingMembersId(null);
      setErrorMessage(null);
    },
    onError: (err) => setErrorMessage(err.message),
  });

  const addMember = trpc.tenant.addMember.useMutation({
    onSuccess: () => {
      void utils.tenant.listMembers.invalidate({
        tenantId: managingMembersId ?? "",
      });
      setNewMemberEmail("");
      setErrorMessage(null);
    },
    onError: (err) => setErrorMessage(err.message),
  });

  const removeMember = trpc.tenant.removeMember.useMutation({
    onSuccess: () => {
      void utils.tenant.listMembers.invalidate({
        tenantId: managingMembersId ?? "",
      });
      setErrorMessage(null);
    },
    onError: (err) => setErrorMessage(err.message),
  });

  const handleCreate = () => {
    setErrorMessage(null);
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmedName) {
      setErrorMessage("Name is required");
      return;
    }
    if (!trimmedSlug) {
      setErrorMessage("Slug is required");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      setErrorMessage(
        "Slug must be lowercase letters, numbers, and hyphens only",
      );
      return;
    }
    createTenant.mutate({
      name: trimmedName,
      slug: trimmedSlug,
      allowedOrigins: parseOriginsInput(originsInput),
    });
  };

  const startEdit = (t: TenantItem) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditSlug(t.slug);
    setEditOriginsInput(formatOriginsForInput(t.allowedOrigins));
    setErrorMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setErrorMessage(null);
  };

  const handleUpdate = () => {
    if (!editingId) return;
    setErrorMessage(null);
    const trimmedName = editName.trim();
    const trimmedSlug = editSlug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmedName) {
      setErrorMessage("Name is required");
      return;
    }
    if (!trimmedSlug) {
      setErrorMessage("Slug is required");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      setErrorMessage(
        "Slug must be lowercase letters, numbers, and hyphens only",
      );
      return;
    }
    updateTenant.mutate({
      id: editingId,
      name: trimmedName,
      slug: trimmedSlug,
      allowedOrigins: parseOriginsInput(editOriginsInput),
    });
  };

  const handleDelete = (id: string, slug: string) => {
    if (
      !globalThis.window?.confirm(
        `Delete tenant "${slug}"? This cannot be undone.`,
      )
    )
      return;
    deleteTenant.mutate({ id });
  };

  const handleAddMember = () => {
    if (!managingMembersId || !newMemberEmail.trim()) return;
    setErrorMessage(null);
    addMember.mutate({
      email: newMemberEmail.trim().toLowerCase(),
      tenantId: managingMembersId,
      role: newMemberRole,
    });
  };

  const handleRemoveMember = (email: string) => {
    if (!managingMembersId) return;
    removeMember.mutate({ email, tenantId: managingMembersId });
  };

  const isForbidden =
    tenantList.error?.data?.code === "FORBIDDEN" ||
    tenantList.error?.message?.toLowerCase().includes("super admin");
  const isUnauth =
    tenantList.error?.data?.code === "UNAUTHORIZED" ||
    tenantList.error?.message?.toLowerCase().includes("logged in");

  const managingTenant = tenants.find((t) => t.id === managingMembersId);

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
          Back to Home
        </Link>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent mb-4">
            Tenant Dashboard
          </h1>
          <p className="text-slate-400 text-lg">
            Manage tenants and their members. Super-admin only.
          </p>
        </div>

        {isUnauth && (
          <div className="mb-6 p-4 bg-amber-900/30 border border-amber-600 rounded-lg text-amber-200">
            You must be logged in to access this page.
          </div>
        )}

        {isForbidden && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-200">
            Super-admin access required. Your email must be in
            SUPER_ADMIN_EMAILS.
          </div>
        )}

        {(errorMessage ||
          createTenant.error?.message ||
          updateTenant.error?.message ||
          deleteTenant.error?.message ||
          addMember.error?.message ||
          removeMember.error?.message) && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-200">
            {errorMessage ||
              createTenant.error?.message ||
              updateTenant.error?.message ||
              deleteTenant.error?.message ||
              addMember.error?.message ||
              removeMember.error?.message}
          </div>
        )}

        {!isUnauth && !isForbidden && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Tenants */}
            <div className="lg:col-span-3 space-y-6">
              {/* Add form */}
              <div className="bg-slate-800 border border-slate-600 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Add tenant
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Name
                      </label>
                      <input
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g. Acme Corp"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Slug (a-z, 0-9, hyphens)
                      </label>
                      <input
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g. acme-corp"
                        value={slug}
                        onChange={(e) =>
                          setSlug(
                            e.target.value.toLowerCase().replace(/\s+/g, "-"),
                          )
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">
                      Allowed origins (one per line or comma-separated)
                    </label>
                    <textarea
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[80px] font-mono text-sm"
                      placeholder={
                        "acme.com\nhttps://acme.com\nhttp://acme.localhost:3000"
                      }
                      value={originsInput}
                      onChange={(e) => setOriginsInput(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={
                      createTenant.isPending || !name.trim() || !slug.trim()
                    }
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg text-white font-semibold transition-all"
                  >
                    {createTenant.isPending ? "Adding..." : "Add tenant"}
                  </button>
                </div>
              </div>

              {/* Tenant list */}
              <div className="bg-slate-800 border border-slate-600 rounded-xl overflow-hidden">
                <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
                  <p className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                    {tenants.length} tenant
                    {tenants.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {tenantList.isLoading && (
                  <div className="p-8 text-center text-slate-400">
                    Loading tenants...
                  </div>
                )}

                {tenants.length === 0 && !tenantList.isLoading && (
                  <div className="p-12 text-center text-slate-400">
                    No tenants yet. Add one above.
                  </div>
                )}

                {tenants.length > 0 && (
                  <ul className="divide-y divide-slate-600">
                    {tenants.map((t) => (
                      <li
                        key={t.id}
                        className={`px-6 py-4 transition-colors ${
                          managingMembersId === t.id
                            ? "bg-blue-500/5 border-l-2 border-l-blue-500"
                            : "hover:bg-slate-700/50"
                        }`}
                      >
                        {editingId === t.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">
                                  Name
                                </label>
                                <input
                                  className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">
                                  Slug
                                </label>
                                <input
                                  className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm"
                                  value={editSlug}
                                  onChange={(e) =>
                                    setEditSlug(
                                      e.target.value
                                        .toLowerCase()
                                        .replace(/\s+/g, "-"),
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">
                                Allowed origins
                              </label>
                              <textarea
                                className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm min-h-[60px] font-mono"
                                value={editOriginsInput}
                                onChange={(e) =>
                                  setEditOriginsInput(e.target.value)
                                }
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleUpdate}
                                disabled={updateTenant.isPending}
                                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded text-white text-sm font-medium"
                              >
                                {updateTenant.isPending ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-4 py-1.5 bg-slate-600 hover:bg-slate-500 rounded text-slate-200 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-white">
                                  {t.name}
                                </span>
                                <span className="text-slate-500 font-mono text-sm">
                                  {t.slug}
                                </span>
                              </div>
                              {t.allowedOrigins.length > 0 && (
                                <p className="text-slate-400 text-sm mt-1 truncate max-w-full">
                                  {t.allowedOrigins.slice(0, 3).join(", ")}
                                  {t.allowedOrigins.length > 3 &&
                                    ` +${t.allowedOrigins.length - 3} more`}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() =>
                                  setManagingMembersId(
                                    managingMembersId === t.id ? null : t.id,
                                  )
                                }
                                className={`p-2 rounded transition-colors ${
                                  managingMembersId === t.id
                                    ? "text-blue-400 bg-blue-500/10"
                                    : "text-slate-400 hover:text-blue-400 hover:bg-slate-600"
                                }`}
                                title="Manage members"
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
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => startEdit(t)}
                                className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-600 rounded transition-colors"
                                title="Edit"
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(t.id, t.slug)}
                                disabled={deleteTenant.isPending}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded transition-colors disabled:opacity-50"
                                title="Delete"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => void utils.tenant.findAll.invalidate()}
                  disabled={tenantList.isRefetching}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 px-4 py-2 rounded-lg text-slate-200 font-medium transition-colors"
                >
                  {tenantList.isRefetching ? "Refreshing..." : "Refresh list"}
                </button>
              </div>
            </div>

            {/* Right: Member management panel */}
            <div className="lg:col-span-2">
              {managingMembersId && managingTenant ? (
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 sticky top-20">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">
                      Members
                    </h2>
                    <span className="text-xs text-slate-500 font-mono">
                      {managingTenant.slug}
                    </span>
                  </div>

                  {/* Add member form */}
                  <div className="space-y-3 mb-6">
                    <input
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="user@example.com"
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
                        <option value="TENANT_USER">User</option>
                        <option value="TENANT_ADMIN">Admin</option>
                      </select>
                      <button
                        onClick={handleAddMember}
                        disabled={addMember.isPending || !newMemberEmail.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                      >
                        {addMember.isPending ? "Adding..." : "Add"}
                      </button>
                    </div>
                  </div>

                  {/* Member list */}
                  {membersQuery.isLoading ? (
                    <p className="text-sm text-slate-400">Loading members...</p>
                  ) : members.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No members yet. Add one above.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {members.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate">
                              {m.email}
                            </p>
                            <p className="text-xs text-slate-500">
                              {m.role === "TENANT_ADMIN" ? "Admin" : "User"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveMember(m.email)}
                            disabled={removeMember.isPending}
                            className="shrink-0 ml-2 p-1 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                            title="Remove member"
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
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-xl p-8 text-center">
                  <svg
                    className="w-10 h-10 mx-auto text-slate-600 mb-3"
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
                  <p className="text-sm text-slate-500">
                    Click the members icon on a tenant to manage its members.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
