/* eslint-disable @typescript-eslint/no-unused-vars */

import { BaseLogger } from "./base-logger";
import { LogLevel } from "./log-level";

export class NoopLogger extends BaseLogger {
  public constructor(logLevel: LogLevel) {
    super(logLevel);
  }

  log(_: LogLevel, __: any): void;
  log(_: LogLevel, __: any, ...___: any[]): void;
  log(_: LogLevel, __: any, ...___: any[]): void {}

  info(_: any): void;
  info(_: any, ...__: any[]): void;
  info(_: any, ...__: any[]): void {}

  warn(_: any): void;
  warn(_: any, ...__: any[]): void;
  warn(_: any, ...__: any[]): void {}

  debug(_: any): void;
  debug(_: any, ...__: any[]): void;
  debug(_: any, ...__: any[]): void {}

  trace(_: any): void;
  trace(_: any, __: string, ...___: any[]): void;
  trace(_: any, ...__: any[]): void;
  trace(_: any, ...__: any[]): void {}

  error(_: any): void;
  error(_: any, ...__: any[]): void;
  error(_: any, ...__: any[]): void {}

  critical(_: any): void;
  critical(_: any, ...__: any[]): void;
  critical(_: unknown, ...__: unknown[]): void {}
}
