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

export const createTrpcClient = (
  url: string,
  getCookies?: () => string,
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
