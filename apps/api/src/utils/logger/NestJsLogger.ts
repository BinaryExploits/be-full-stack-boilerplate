import { ConsoleLogger } from '@nestjs/common';
import { RollbarService } from '@andeanwide/nestjs-rollbar';
import { ILogger, LogLevel } from '@repo/utils-core';

export class NestJsLogger implements ILogger {
  constructor(
    private readonly currentLogLevel: LogLevel,
    private readonly context: string,
    private readonly consoleLogger: ConsoleLogger,
    private readonly rollbar?: RollbarService,
  ) {
    this.consoleLogger.setContext(context);
    this.info(`NestJsLogger initialized (Rollbar: ${!!rollbar})`);
  }

  log(logLevel: LogLevel, message: any): void;
  log(logLevel: LogLevel, message: any, ...optionalParams: any[]): void;
  log(logLevel: LogLevel, message: any, ...optionalParams: unknown[]): void {
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

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLogLevel;
  }

  writeLog(level: LogLevel, message: any, ...optionalParams: unknown[]): void {
    if (!this.shouldLog(level)) return;

    this.routeToConsole(level, message, ...optionalParams);
    this.sendToRollbar(level, message as string);
  }

  private routeToConsole(
    level: LogLevel,
    message: any,
    ...optionalParams: unknown[]
  ): void {
    switch (level) {
      case LogLevel.ERROR:
        this.consoleLogger.error(message, ...optionalParams);
        break;
      case LogLevel.WARN:
        this.consoleLogger.warn(message, ...optionalParams);
        break;
      case LogLevel.DEBUG:
        this.consoleLogger.debug(message, ...optionalParams);
        break;
      case LogLevel.TRACE:
        this.consoleLogger.verbose(message, ...optionalParams);
        break;
      default:
        this.consoleLogger.log(message, ...optionalParams);
    }
  }

  private sendToRollbar(level: LogLevel, message: string): void {
    if (!this.rollbar) return;

    try {
      switch (level) {
        case LogLevel.ERROR:
          this.rollbar.error(message);
          break;
        case LogLevel.WARN:
          this.rollbar.warn(message);
          break;
        case LogLevel.INFO:
          this.rollbar.info(message);
          break;
        case LogLevel.DEBUG:
          this.rollbar.log(message);
          break;
        case LogLevel.TRACE:
          this.rollbar.critical(message);
          break;
      }
    } catch (err) {
      this.consoleLogger.error('Rollbar failed: ' + (err as Error).message);
    }
  }
}
