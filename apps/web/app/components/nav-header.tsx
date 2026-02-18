"use client";

import Link from "next/link";
import { TenantSwitcher } from "./tenant-switcher";
import { useAuthClient } from "../lib/auth/auth-client";

export function NavHeader() {
  const authClient = useAuthClient();
  const sessionResult = authClient?.useSession?.();
  const session = sessionResult?.data;

  if (!session?.user) return null;

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
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="hidden sm:inline truncate max-w-[120px]">
                {session.user.email}
              </span>
              <button
                onClick={() => void authClient?.signOut?.()}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-slate-800"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
