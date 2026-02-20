"use client";

import { usePathname } from "next/navigation";
import { useAuthClient } from "../../lib/auth/auth-client";
import { AppSidebar } from "./app-sidebar";
import { NavHeader } from "../nav-header";

const PUBLIC_PATHS = [
  "/auth-demo",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authClient = useAuthClient();
  const sessionResult = authClient?.useSession?.();
  const session = sessionResult?.data;
  const isAuthenticated = !!session?.user;

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (isPublicPath || !isAuthenticated) {
    return (
      <>
        <NavHeader />
        <div className="pt-14">{children}</div>
      </>
    );
  }

  return (
    <>
      <NavHeader />
      <div className="flex min-h-screen pt-14 bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <AppSidebar />
        <main className="flex-1 min-w-0">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </>
  );
}
