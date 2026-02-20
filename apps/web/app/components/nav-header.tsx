"use client";

import Link from "next/link";
import { TenantSwitcher } from "./tenant-switcher";
import { LanguageSelector } from "./LanguageSelector";
import { useAuthClient } from "../lib/auth/auth-client";
import { useI18n } from "../hooks/useI18n";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-8 w-8" />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

export function NavHeader() {
  const { LL } = useI18n();
  const authClient = useAuthClient();
  const sessionResult = authClient?.useSession?.();
  const session = sessionResult?.data;
  const isAuthenticated = !!session?.user;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-gray-200/50 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
              <span className="text-slate-900 font-bold text-xs">BE</span>
            </div>
            <span className="hidden sm:inline text-sm">
              {LL.Navigation.fullStack()}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSelector />
            {isAuthenticated && <TenantSwitcher />}
          </div>
        </div>
      </div>
    </nav>
  );
}
