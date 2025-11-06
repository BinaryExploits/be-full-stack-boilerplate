"use client";

import { DefaultLogger, Logger, LogLevel } from "@repo/utils-core";

export function LoggerProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  Logger.setInstance(new DefaultLogger(LogLevel.INFO));
  return <>{children}</>;
}
