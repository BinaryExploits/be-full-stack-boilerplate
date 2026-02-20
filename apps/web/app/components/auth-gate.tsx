"use client";

import { usePathname } from "next/navigation";
import { useAuthClient } from "../lib/auth/auth-client";
import { useI18n } from "../hooks/useI18n";

const PUBLIC_PATHS = [
  "/auth-demo",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authClient = useAuthClient();
  const sessionResult = authClient?.useSession?.();

  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return <>{children}</>;
  }

  if (!authClient || sessionResult === undefined) {
    return <AuthGateLoading />;
  }

  const isPending =
    sessionResult && "isPending" in sessionResult
      ? (sessionResult as { isPending?: boolean }).isPending
      : false;

  if (isPending) {
    return <AuthGateLoading />;
  }

  const session = sessionResult?.data;
  if (!session?.user) {
    return <AuthGateLogin />;
  }

  return <>{children}</>;
}

function AuthGateLoading() {
  const { LL } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="text-center">
        <div
          className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-b-blue-400 border-transparent"
          aria-hidden
        />
        <p className="mt-4 text-gray-500 dark:text-slate-400 text-sm">
          {LL.Common.loading()}
        </p>
      </div>
    </div>
  );
}

function AuthGateLogin() {
  const { LL } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
          <span className="text-slate-900 font-bold text-xl">BE</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {LL.Auth.signInRequired()}
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mb-8">
          {LL.Auth.signInRequiredMessage()}
        </p>
        <a
          href="/sign-in"
          className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-8 py-3 rounded-lg text-white font-semibold transition-all"
        >
          {LL.Auth.signIn()}
        </a>
      </div>
    </div>
  );
}
