"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { getFrontendUrl } from "../utils/url";

type AuthClient = ReturnType<typeof createAuthClient>;

const authClientStatic = createAuthClient({
  baseURL: getFrontendUrl(),
  plugins: [emailOTPClient()],
});

/** Default export for SSR or when current origin is not needed (e.g. single domain). */
export const authClient = authClientStatic;

const AuthClientContext = createContext<AuthClient | null>(null);

/**
 * Provider that creates an auth client with the current page origin (window.location.origin).
 * Use this so sign-in/sign-up work on subdomains (e.g. binaryexports.localhost:3000);
 * otherwise the client would use a fixed baseURL and cookies wouldn't match the subdomain.
 * Client is created in the browser (lazy init + effect fallback) so hooks like useSession are available.
 */
export function AuthClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<AuthClient | null>(() => {
    if (typeof window !== "undefined" && window.location?.origin) {
      return createAuthClient({
        baseURL: window.location.origin,
        plugins: [emailOTPClient()],
      });
    }
    return null;
  });

  useEffect(() => {
    if (client != null) return;
    if (typeof window !== "undefined" && window.location?.origin) {
      try {
        setClient(
          createAuthClient({
            baseURL: window.location.origin,
            plugins: [emailOTPClient()],
          }),
        );
      } catch {
        setClient(authClientStatic);
      }
    }
  }, [client]);

  useEffect(() => {
    if (client != null) return;
    const t = setTimeout(() => setClient(authClientStatic), 500);
    return () => clearTimeout(t);
  }, [client]);

  return (
    <AuthClientContext.Provider value={client}>
      {children}
    </AuthClientContext.Provider>
  );
}

/** Use the auth client (with current page origin when inside AuthClientProvider). Returns null until mounted in the browser. */
export function useAuthClient(): AuthClient | null {
  return useContext(AuthClientContext);
}
