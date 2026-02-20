"use client";

import { AuthGate } from "./auth-gate";
import { TenantGate } from "./tenant-gate";
import { AppLayout } from "./layout/app-layout";
import { LocaleProvider } from "../providers/LocaleProvider";
import { CookieBanner } from "./cookie-banner";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <AppLayout>
        <AuthGate>
          <TenantGate>{children}</TenantGate>
        </AuthGate>
      </AppLayout>
      <CookieBanner />
    </LocaleProvider>
  );
}
