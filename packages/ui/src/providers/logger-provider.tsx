"use client";

import { DefaultLogger, Logger, LogLevel } from "@repo/utils-core";
import React from "react";

export function LoggerProvider({
  logLevel,
  children,
}: Readonly<{ logLevel: LogLevel; children: React.ReactNode }>) {
  if (!(Logger.instance instanceof DefaultLogger)) {
    Logger.setInstance(DefaultLogger.create(logLevel));
    Logger.instance.info(
      `${LoggerProvider.name} initialized with ${DefaultLogger.name}`,
    );
  }
  return <>{children}</>;
}
