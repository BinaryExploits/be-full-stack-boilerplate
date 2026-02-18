"use client";

import { usePathname } from "next/navigation";
import { useAuthClient } from "../lib/auth/auth-client";

const PUBLIC_PATHS = ["/auth-demo"];

/**
 * Gate that blocks rendering of children until the user is authenticated.
 * Routes in PUBLIC_PATHS are always accessible (e.g. the login page).
 * When unauthenticated, shows a login prompt redirecting to /auth-demo.
 * When auth state is still loading, shows a spinner.
 */
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
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <div
          className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-b-blue-400 border-transparent"
          aria-hidden
        />
        <p className="mt-4 text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function AuthGateLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
          <span className="text-slate-900 font-bold text-xl">BE</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Sign in required</h1>
        <p className="text-slate-400 mb-8">
          You need to be authenticated to access this application.
        </p>
        <a
          href="/auth-demo"
          className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-8 py-3 rounded-lg text-white font-semibold transition-all"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
