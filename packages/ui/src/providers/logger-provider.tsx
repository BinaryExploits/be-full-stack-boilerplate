"use client";

import {
  DefaultLogger,
  Logger,
  LogLevel,
} from "@repo/utils-core";
import React from "react";

export function LoggerProvider({ logLevel, children,
}: Readonly<{ logLevel: LogLevel, children: React.ReactNode }>) {
  //TODO: create a factory to logger instances
  Logger.setInstance(DefaultLogger.create(logLevel));
  Logger.instance.info(`LoggerProvider rendered, Logger ${DefaultLogger.name}`);
  return <>{children}</>;
}
