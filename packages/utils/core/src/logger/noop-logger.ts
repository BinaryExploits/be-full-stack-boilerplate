/* eslint-disable @typescript-eslint/no-unused-vars */

import { BaseLogger } from "./base-logger";
import { LogLevel } from "./log-level";

export class NoopLogger extends BaseLogger {
  public constructor(logLevel: LogLevel) {
    super(logLevel);
  }

  static create(logLevel: LogLevel): NoopLogger {
    return new NoopLogger(logLevel);
  }

  log(_: LogLevel, __: any): void;
  log(_: LogLevel, __: any, ...___: any[]): void;
  log(_: LogLevel, __: any, ...___: any[]): void {
    // Intentionally empty - NoopLogger implements the Null Object pattern to disable logging without code changes
  }

  info(_: any): void;
  info(_: any, ...__: any[]): void;
  info(_: any, ...__: any[]): void {
    // Intentionally empty - NoopLogger implements the Null Object pattern to disable logging without code changes
  }

  warn(_: any): void;
  warn(_: any, ...__: any[]): void;
  warn(_: any, ...__: any[]): void {
    // Intentionally empty - NoopLogger implements the Null Object pattern to disable logging without code changes
  }

  debug(_: any): void;
  debug(_: any, ...__: any[]): void;
  debug(_: any, ...__: any[]): void {
    // Intentionally empty - NoopLogger implements the Null Object pattern to disable logging without code changes
  }

  trace(_: any): void;
  trace(_: any, __: string, ...___: any[]): void;
  trace(_: any, ...__: any[]): void;
  trace(_: any, ...__: any[]): void {
    // Intentionally empty - NoopLogger implements the Null Object pattern to disable logging without code changes
  }

  error(_: any): void;
  error(_: any, ...__: any[]): void;
  error(_: any, ...__: any[]): void {
    // Intentionally empty - NoopLogger implements the Null Object pattern to disable logging without code changes
  }

  critical(_: any): void;
  critical(_: any, ...__: any[]): void;
  critical(_: unknown, ...__: unknown[]): void {
    // Intentionally empty - NoopLogger implements the Null Object pattern to disable logging without code changes
  }
}
