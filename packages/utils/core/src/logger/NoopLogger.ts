/* eslint-disable @typescript-eslint/no-unused-vars */

import { BaseLogger } from "./BaseLogger";
import { LogLevel } from "./LogLevel";

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
}
