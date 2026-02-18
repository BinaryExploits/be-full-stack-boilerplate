import {
  createTRPCReact,
  CreateTRPCReact,
  httpBatchLink,
} from "@trpc/react-query";
import { AppRouter } from "../server/server";
import { QueryClient } from "@tanstack/react-query";

export const trpc: CreateTRPCReact<AppRouter, object> = createTRPCReact<
  AppRouter,
  object
>();

export const queryClient = new QueryClient();

/** Header sent so backend can resolve tenant when request is proxied (e.g. Next.js rewrite). */
export const TENANT_ORIGIN_HEADER = "x-tenant-origin";

export const createTrpcClient = (
  url: string,
  getCookies?: () => string,
  /** When set (e.g. from SSR request headers), sent as x-tenant-origin so API can resolve tenant. */
  serverOrigin?: string,
) => {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url,
        headers() {
          const headers = new Map<string, string>();
          if (getCookies) {
            const cookies: string = getCookies();
            if (cookies) {
              headers.set("Cookie", cookies);
            }
          }
          const pageOrigin =
            globalThis.window?.location?.origin ?? serverOrigin;
          if (pageOrigin) {
            headers.set(TENANT_ORIGIN_HEADER, pageOrigin);
          }
          return Object.fromEntries(headers);
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          } as RequestInit);
        },
      }),
    ],
  });
};
