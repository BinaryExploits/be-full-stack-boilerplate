import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import TrpcProvider from "@repo/trpc/trpc-provider";
import {
  DefaultLogger,
  FlagExtensions,
  Logger,
  LogLevel,
} from "@repo/utils-core";
import { LoggerProvider } from "@repo/ui/logger-provider";
import { AuthClientProvider } from "./lib/auth/auth-client";
import React from "react";

export const metadata: Metadata = {
  title: "BE: Tech Stack",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  setupServerLogger();
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const proto = headersList.get("x-forwarded-proto") ?? "https";
  const serverOrigin = host ? `${proto}://${host}` : undefined;
  return (
    <html lang="en">
      <body>
        <TrpcProvider
          url={process.env.NEXT_PUBLIC_TRPC_URL!}
          serverOrigin={serverOrigin}
        >
          <AuthClientProvider>
            <LoggerProvider
              logLevel={FlagExtensions.fromStringList(
                process.env.LOG_LEVELS,
                LogLevel,
              )}
            >
              {children}
            </LoggerProvider>
          </AuthClientProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}

function setupServerLogger() {
  const consoleLogLevel: LogLevel = FlagExtensions.fromStringList(
    process.env.LOG_LEVELS,
    LogLevel,
  );

  Logger.setInstance(DefaultLogger.create(consoleLogLevel));
}
