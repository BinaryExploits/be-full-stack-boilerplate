"use client";

import { PropsWithChildren } from "react";
import { createTrpcClient, queryClient, trpc } from "../client";
import { QueryClientProvider } from "@tanstack/react-query";

interface TrpcProviderProps extends PropsWithChildren {
  url: string;
  getCookies: (() => string) | undefined;
}

export default function TrpcProvider({ children, url, getCookies }: Readonly<TrpcProviderProps>) {
  const client = createTrpcClient(url, getCookies);

  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}