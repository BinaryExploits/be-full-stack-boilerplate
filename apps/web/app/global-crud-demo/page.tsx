"use client";

import { useState } from "react";
import { trpc } from "@repo/trpc/client";
import Link from "next/link";
import { useI18n } from "../hooks/useI18n";

type DbType = "mongoose" | "prisma";

interface GlobalCrudItem {
  id: string;
  content: string;
}

function GlobalCrudPanel({ dbType }: Readonly<{ dbType: DbType }>) {
  const { LL } = useI18n();
  const utils = trpc.useUtils();
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const isMongoose = dbType === "mongoose";
  const label = isMongoose ? "Mongoose (MongoDB)" : "Prisma (PostgreSQL)";
  const gradientColors = isMongoose
    ? "from-green-400 to-emerald-400"
    : "from-amber-400 to-orange-500";
  const buttonColors = isMongoose
    ? "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
    : "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700";
  const hoverColor = isMongoose
    ? "hover:text-green-400"
    : "hover:text-amber-400";

  const list = trpc.globalCrud[
    isMongoose ? "findAllMongo" : "findAllPrisma"
  ].useQuery({}, { refetchOnWindowFocus: false });

  const createItem = trpc.globalCrud[
    isMongoose ? "createMongo" : "createPrisma"
  ].useMutation({
    onSuccess: () => {
      void utils.globalCrud[
        isMongoose ? "findAllMongo" : "findAllPrisma"
      ].invalidate();
      setContent("");
    },
  });

  const deleteItem = trpc.globalCrud[
    isMongoose ? "deleteMongo" : "deletePrisma"
  ].useMutation({
    onSuccess: () =>
      void utils.globalCrud[
        isMongoose ? "findAllMongo" : "findAllPrisma"
      ].invalidate(),
  });

  const updateItem = trpc.globalCrud[
    isMongoose ? "updateMongo" : "updatePrisma"
  ].useMutation({
    onSuccess: () => {
      void utils.globalCrud[
        isMongoose ? "findAllMongo" : "findAllPrisma"
      ].invalidate();
      setEditingId(null);
      setEditingContent("");
    },
  });

  const handleCreate = () => {
    if (!content.trim()) return;
    createItem.mutate({ content });
  };

  const handleUpdate = (id: string) => {
    if (!editingContent.trim()) return;
    updateItem.mutate({ id, data: { content: editingContent } });
  };

  const handleDelete = (id: string) => {
    deleteItem.mutate({ id });
  };

  const handleRefresh = () => {
    void utils.globalCrud[
      isMongoose ? "findAllMongo" : "findAllPrisma"
    ].invalidate();
  };

  const renderListContent = () => {
    if (list.isLoading) {
      return (
        <div className="p-8 text-center">
          <p className="text-slate-400">{LL.Common.loadingItems()}</p>
        </div>
      );
    }

    if (list.data && list.data.items.length > 0) {
      return (
        <div>
          <div className="px-6 py-4 bg-slate-600 border-b border-slate-500">
            <p className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              {LL.Common.itemCountGlobal({ count: list.data.items.length })}
            </p>
          </div>
          <ul className="divide-y divide-slate-600">
            {list.data.items.map((item: GlobalCrudItem) => (
              <li
                key={item.id}
                className="px-6 py-4 flex justify-between items-center hover:bg-slate-600 transition-colors"
              >
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && editingContent.trim()) {
                        handleUpdate(item.id);
                      } else if (e.key === "Escape") {
                        setEditingId(null);
                      }
                    }}
                    autoFocus
                    className={`flex-1 bg-slate-600 border rounded px-2 py-1 text-white focus:outline-none focus:ring-2 ${
                      isMongoose
                        ? "border-green-400 focus:ring-green-400"
                        : "border-amber-400 focus:ring-amber-400"
                    }`}
                  />
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingContent(item.content);
                    }}
                    className={`text-slate-200 font-medium cursor-pointer ${hoverColor} transition-colors flex-1 text-left`}
                  >
                    {item.content}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteItem.isPending}
                  className="text-slate-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-2 hover:bg-slate-700 rounded ml-2"
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
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div className="p-12 text-center">
        <p className="text-slate-400 text-lg">{LL.Common.noItemsYet()}</p>
      </div>
    );
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-r ${gradientColors} flex items-center justify-center`}
          >
            <span className="text-slate-900 font-bold text-lg">
              {isMongoose ? "M" : "P"}
            </span>
          </div>
          <h2
            className={`text-2xl font-bold bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`}
          >
            {label}
          </h2>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-3">
          <input
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
            placeholder={LL.Dashboard.addTextPlaceholder()}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            disabled={createItem.isPending}
          />
          <button
            onClick={handleCreate}
            disabled={!content.trim() || createItem.isPending}
            className={`bg-gradient-to-r ${buttonColors} disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg`}
          >
            {createItem.isPending ? LL.Common.adding() : LL.Common.add()}
          </button>
        </div>
      </div>

      <div className="mb-6 flex justify-center">
        <button
          onClick={handleRefresh}
          disabled={list.isRefetching}
          className={`bg-gradient-to-r ${buttonColors} disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white font-semibold transition-colors`}
        >
          {list.isRefetching ? LL.Common.refreshing() : LL.Common.refresh()}
        </button>
      </div>

      <div className="bg-slate-700 rounded-lg shadow-2xl overflow-hidden border border-slate-600">
        {renderListContent()}
      </div>
    </div>
  );
}

export default function GlobalCrudDemo() {
  const { LL } = useI18n();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent mb-4">
            {LL.Dashboard.globalCrudDemoTitle()}
          </h1>
          <p className="text-slate-400 text-lg">
            {LL.Dashboard.globalCrudDemoSubtitle()}
          </p>
          <p className="text-slate-500 text-sm mt-2">
            {LL.Dashboard.globalCrudDemoTechStack()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlobalCrudPanel dbType="mongoose" />
          <GlobalCrudPanel dbType="prisma" />
        </div>
      </div>
    </main>
  );
}
