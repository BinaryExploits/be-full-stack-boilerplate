"use client";

import { PropsWithChildren } from "react";
import { createTrpcClient, queryClient, trpc } from "../client";
import { QueryClientProvider } from "@tanstack/react-query";

interface TrpcProviderProps extends PropsWithChildren {
  url: string;
  getCookies?: () => string;
  /** Origin for SSR so API can resolve tenant (e.g. from request Host / x-forwarded-host). */
  serverOrigin?: string;
}

export default function TrpcProvider({
  children,
  url,
  getCookies,
  serverOrigin,
}: Readonly<TrpcProviderProps>) {
  const client = createTrpcClient(url, getCookies, serverOrigin);

  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
