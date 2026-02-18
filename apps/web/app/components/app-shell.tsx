"use client";

import { AuthGate } from "./auth-gate";
import { TenantGate } from "./tenant-gate";
import { NavHeader } from "./nav-header";

/**
 * Client-side shell that gates the entire app behind auth,
 * then ensures a tenant is selected before rendering children.
 * Also provides the shared nav header with the tenant switcher.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <TenantGate>
        <NavHeader />
        <div className="pt-14">{children}</div>
      </TenantGate>
    </AuthGate>
  );
}
