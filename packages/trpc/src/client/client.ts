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

export const createTrpcClient = (url: string) => {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url,
      }),
    ],
  });
};