"use client";

import { useI18n } from "../hooks/useI18n";

/**
 * Single loading shell for auth-demo. Used by the dynamic import and by
 * AuthDemoClient so server and client never render different markup (avoids hydration mismatch).
 */
export function AuthDemoLoadingShell() {
  const { LL } = useI18n();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="text-center">
        <div
          className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-b-gray-900 dark:border-b-blue-400 border-transparent"
          aria-hidden
        />
        <p className="mt-4 text-gray-600 dark:text-slate-400">
          {LL.Common.loading()}
        </p>
      </div>
    </div>
  );
}
