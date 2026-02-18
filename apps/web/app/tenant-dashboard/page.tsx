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

  const tenantList = trpc.tenant.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const tenants: TenantItem[] =
    (tenantList.data as { tenants?: TenantItem[] } | undefined)?.tenants ?? [];

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
    if (!window.confirm(`Delete tenant "${slug}"? This cannot be undone.`))
      return;
    deleteTenant.mutate({ id });
  };

  const isForbidden =
    tenantList.error?.data?.code === "FORBIDDEN" ||
    tenantList.error?.message?.toLowerCase().includes("super admin");
  const isUnauth =
    tenantList.error?.data?.code === "UNAUTHORIZED" ||
    tenantList.error?.message?.toLowerCase().includes("logged in");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
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
            View, add, edit, and remove tenants. Super-admin only.
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
          deleteTenant.error?.message) && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-200">
            {errorMessage ||
              createTenant.error?.message ||
              updateTenant.error?.message ||
              deleteTenant.error?.message}
          </div>
        )}

        {!isUnauth && !isForbidden && (
          <>
            {/* Add form */}
            <div className="mb-8 bg-slate-800 border border-slate-600 rounded-xl p-6">
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

            {/* List */}
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
                      className="px-6 py-4 hover:bg-slate-700/50 transition-colors"
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

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => void utils.tenant.findAll.invalidate()}
                disabled={tenantList.isRefetching}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 px-4 py-2 rounded-lg text-slate-200 font-medium transition-colors"
              >
                {tenantList.isRefetching ? "Refreshing..." : "Refresh list"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
