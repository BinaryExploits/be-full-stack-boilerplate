import { LogLevel } from "./log-level";
import { BaseLogger } from "./base-logger";
import { StringExtensions } from "../extensions";
import { DateExtensions } from "../extensions/date.extensions";

export class DefaultLogger extends BaseLogger {
  static create(logLevel: LogLevel): DefaultLogger {
    return new DefaultLogger(logLevel);
  }

  protected constructor(logLevel: LogLevel) {
    super(logLevel);
  }

  info(message: any): void;
  info(message: any, ...optionalParams: any[]): void;
  info(message: any, ...optionalParams: unknown[]): void {
    this.writeLog(LogLevel.Info, message, ...optionalParams);
  }

  warn(message: any): void;
  warn(message: any, ...optionalParams: any[]): void;
  warn(message: any, ...optionalParams: unknown[]): void {
    this.writeLog(LogLevel.Warn, message, ...optionalParams);
  }

  debug(message: any): void;
  debug(message: any, ...optionalParams: any[]): void;
  debug(message: any, ...optionalParams: unknown[]): void {
    this.writeLog(LogLevel.Debug, message, ...optionalParams);
  }

  trace(message: any): void;
  trace(message: any, ...optionalParams: any[]): void;
  trace(message: any, ...optionalParams: unknown[]): void {
    this.writeLog(LogLevel.Trace, message, ...optionalParams);
  }

  error(message: any): void;
  error(message: any, ...optionalParams: any[]): void;
  error(message: any, ...optionalParams: unknown[]): void {
    this.writeLog(LogLevel.Error, message, ...optionalParams);
  }

  critical(message: any): void;
  critical(message: any, ...optionalParams: any[]): void;
  critical(message: any, ...optionalParams: unknown[]): void {
    this.writeLog(LogLevel.Critical, message, ...optionalParams);
  }

  private formatLog(
    logLevel: LogLevel,
    message: any,
    ...optionalParams: unknown[]
  ): unknown[] {
    const timestamp: string = DateExtensions.FormatAsTimestamp(new Date());

    const level: string = LogLevel[logLevel];
    return [
      `[${timestamp}] [${level}]`,
      ...(StringExtensions.IsNullOrEmpty(this.tempContext)
        ? []
        : [`[${this.tempContext}]`]),
      message,
      ...optionalParams,
    ];
  }

  private writeLog(
    logLevel: LogLevel,
    message: any,
    ...optionalParams: unknown[]
  ): void {
    if (!this.shouldLog(logLevel)) return;

    const formattedLog: unknown[] = this.formatLog(
      logLevel,
      message,
      ...optionalParams,
    );

    switch (logLevel) {
      case LogLevel.Info:
        console.log(...formattedLog);
        break;
      case LogLevel.Warn:
        console.warn(...formattedLog);
        break;
      case LogLevel.Debug:
        console.debug(...formattedLog);
        break;
      case LogLevel.Trace:
        console.trace(...formattedLog);
        break;
      case LogLevel.Error:
      case LogLevel.Critical:
        console.error(...formattedLog);
        break;
      default:
        break;
    }

    this.clearTempContext();
  }
}
