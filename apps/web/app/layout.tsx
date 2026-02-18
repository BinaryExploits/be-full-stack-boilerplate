import type { Metadata } from "next";
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
import { AppShell } from "./components/app-shell";
import React from "react";

export const metadata: Metadata = {
  title: "BE: Tech Stack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  setupServerLogger();
  return (
    <html lang="en">
      <body>
        <TrpcProvider url={process.env.NEXT_PUBLIC_TRPC_URL!}>
          <AuthClientProvider>
            <LoggerProvider
              logLevel={FlagExtensions.fromStringList(
                process.env.LOG_LEVELS,
                LogLevel,
              )}
            >
              <AppShell>{children}</AppShell>
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
