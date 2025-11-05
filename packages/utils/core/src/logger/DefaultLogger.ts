import { LogLevel } from "./LogLevel";
import { BaseLogger } from "./BaseLogger";

export class DefaultLogger extends BaseLogger {
  public constructor(logLevel: LogLevel) {
    super(logLevel);
  }

  log(logLevel: LogLevel, message: any): void;
  log(logLevel: LogLevel, message: any, ...optionalParams: any[]): void;
  log(logLevel: LogLevel, message: string, ...optionalParams: unknown[]): void {
    this.writeLog(logLevel, message, ...optionalParams);
  }

  info(message: any): void;
  info(message: any, ...optionalParams: any[]): void;
  info(message: string, ...optionalParams: unknown[]): void {
    this.writeLog(LogLevel.INFO, message, ...optionalParams);
  }

  warn(message: any): void;
  warn(message: any, ...optionalParams: any[]): void;
  warn(message: string, ...optionalParams: unknown[]): void {
    this.writeLog(LogLevel.WARN, message, ...optionalParams);
  }

  debug(message: any): void;
  debug(message: any, ...optionalParams: any[]): void;
  debug(message: string, ...optionalParams: unknown[]): void {
    this.writeLog(LogLevel.DEBUG, message, ...optionalParams);
  }

  trace(message: any): void;
  trace(message: any, context: string, ...optionalParams: any[]): void;
  trace(message: any, ...optionalParams: any[]): void;
  trace(message: string, ...optionalParams: unknown[]): void {
    this.writeLog(LogLevel.TRACE, message, ...optionalParams);
  }

  error(message: any): void;
  error(message: any, ...optionalParams: any[]): void;
  error(message: string, ...optionalParams: unknown[]): void {
    this.writeLog(LogLevel.ERROR, message, ...optionalParams);
  }

  private writeLog(
    logLevel: LogLevel,
    message: any,
    ...optionalParams: unknown[]
  ): void {
    if (!this.shouldLog(logLevel)) return;

    switch (logLevel) {
      case LogLevel.INFO:
        console.log(message, ...optionalParams);
        break;
      case LogLevel.WARN:
        console.warn(message, ...optionalParams);
        break;
      case LogLevel.DEBUG:
        console.debug(message, ...optionalParams);
        break;
      case LogLevel.TRACE:
        console.trace(message, ...optionalParams);
        break;
      case LogLevel.ERROR:
        console.error(message, ...optionalParams);
        break;
      default:
        break;
    }
  }
}
