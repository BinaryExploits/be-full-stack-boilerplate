"use client";

import { AuthGate } from "./auth-gate";
import { TenantGate } from "./tenant-gate";
import { NavHeader } from "./nav-header";
import { LocaleProvider } from "../providers/LocaleProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <NavHeader />
      <div className="pt-14">
        <AuthGate>
          <TenantGate>{children}</TenantGate>
        </AuthGate>
      </div>
    </LocaleProvider>
  );
}
