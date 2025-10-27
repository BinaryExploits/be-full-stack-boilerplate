"use client";

import { useState } from "react";
import { trpc } from "@repo/trpc/client";

export default function Home() {
  return <CrudTestUI />;
}

function CrudTestUI() {
  const utils = trpc.useUtils();
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // Queries
  const crudList = trpc.crud.findAll.useQuery(
    {},
    {
      refetchOnWindowFocus: false,
    },
  );

  // Mutations
  const createCrud = trpc.crud.createCrud.useMutation({
    onSuccess: () => {
      utils.crud.findAll.invalidate();
      setContent("");
    },
  });

  const deleteCrud = trpc.crud.deleteCrud.useMutation({
    onSuccess: () => utils.crud.findAll.invalidate(),
  });

  const updateCrud = trpc.crud.updateCrud?.useMutation({
    onSuccess: () => {
      utils.crud.findAll.invalidate();
      setEditingId(null);
      setEditingContent("");
    },
  });

  const handleCreate = () => {
    if (!content.trim()) return;
    createCrud.mutate({ content });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
              <span className="text-slate-900 font-bold text-lg">✓</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              BE Tech Stack CRUD
            </h1>
          </div>
          <p className="text-slate-400">
            NextJs (tailwindcss), NestJs, Expo, Trpc
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          <div className="flex gap-3">
            <input
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              placeholder="Add text here"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              disabled={createCrud.isPending}
            />
            <button
              onClick={handleCreate}
              disabled={!content.trim() || createCrud.isPending}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
            >
              {createCrud.isPending ? "Adding..." : "Add"}
            </button>
          </div>
        </div>

        {/* List Section */}
        <div className="bg-slate-700 rounded-lg shadow-2xl overflow-hidden border border-slate-600">
          {crudList.isLoading ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">Loading items...</p>
            </div>
          ) : crudList.data && crudList.data.cruds.length > 0 ? (
            <div>
              <div className="px-6 py-4 bg-slate-600 border-b border-slate-500">
                <p className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  {crudList.data.cruds.length}{" "}
                  {crudList.data.cruds.length === 1 ? "Item" : "Items"}
                </p>
              </div>
              <ul className="divide-y divide-slate-600">
                {crudList.data.cruds.map((item) => (
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
                            updateCrud?.mutate({
                              id: item.id,
                              data: { content: editingContent },
                            });
                          } else if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        autoFocus
                        className="flex-1 bg-slate-600 border border-blue-400 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    ) : (
                      <span
                        onClick={() => {
                          setEditingId(item.id);
                          setEditingContent(item.content);
                        }}
                        className="text-slate-200 font-medium cursor-pointer hover:text-blue-400 transition-colors flex-1"
                      >
                        {item.content}
                      </span>
                    )}
                    <button
                      onClick={() => deleteCrud.mutate({ id: item.id })}
                      disabled={deleteCrud.isPending}
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
          ) : (
            <div className="p-12 text-center">
              <p className="text-slate-400 text-lg">
                No items yet. Add one to get started!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
