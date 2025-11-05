import { LogLevel } from "./LogLevel";

export interface ILogger {
  readonly logLevel: LogLevel;

  withContext(context: string): ILogger;

  log(logLevel: LogLevel, message: any): void;
  log(logLevel: LogLevel, message: any, ...optionalParams: any[]): void;

  info(message: any): void;
  info(message: any, ...optionalParams: any[]): void;

  warn(message: any): void;
  warn(message: any, ...optionalParams: any[]): void;

  debug(message: any): void;
  debug(message: any, ...optionalParams: any[]): void;

  trace(message: any): void;
  trace(message: any, ...optionalParams: any[]): void;

  error(message: any): void;
  error(message: any, ...optionalParams: any[]): void;
}
