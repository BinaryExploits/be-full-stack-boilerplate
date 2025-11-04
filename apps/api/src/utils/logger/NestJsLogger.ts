import { ConsoleLogger } from '@nestjs/common';
import { RollbarService } from '@andeanwide/nestjs-rollbar';
import { ILogger, LogLevel, LogContext } from '@repo/utils-core';

export class NestJsLogger implements ILogger {
  constructor(
    private readonly currentLogLevel: LogLevel,
    private readonly context: string,
    private readonly consoleLogger: ConsoleLogger,
    private readonly rollbar?: RollbarService,
  ) {
    this.consoleLogger.log(`NestJsLogger initialized (Rollbar: ${!!rollbar})`);
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLogLevel;
  }

  log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;
    this.sendToRollbar(level, message, context);
    const formatted = this.formatContext(context);
    this.routeToConsole(level, message, formatted);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  trace(message: string, context?: LogContext): void {
    this.log(LogLevel.TRACE, message, context);
  }

  private routeToConsole(level: LogLevel, message: string, context?: string) {
    switch (level) {
      case LogLevel.ERROR:
        this.consoleLogger.error(message, context || this.context);
        break;
      case LogLevel.WARN:
        this.consoleLogger.warn(message, context || this.context);
        break;
      case LogLevel.DEBUG:
        this.consoleLogger.debug(message, context || this.context);
        break;
      case LogLevel.TRACE:
        this.consoleLogger.verbose(message, context || this.context);
        break;
      default:
        this.consoleLogger.log(message, context || this.context);
    }
  }

  private sendToRollbar(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): void {
    if (!this.rollbar) return;
    try {
      switch (level) {
        case LogLevel.ERROR:
          this.rollbar.error(message, context);
          break;
        case LogLevel.WARN:
          this.rollbar.warn(message, context);
          break;
        case LogLevel.INFO:
          this.rollbar.info(message, context);
          break;
        case LogLevel.DEBUG:
          this.rollbar.log(message, context);
          break;
        case LogLevel.TRACE:
          this.rollbar.critical(message, context);
          break;
      }
    } catch (err) {
      this.consoleLogger.error('Rollbar failed: ' + (err as Error).message);
    }
  }

  private formatContext(context?: LogContext): string | undefined {
    const merged = context
      ? { logger: this.context, ...context }
      : { logger: this.context };
    try {
      return JSON.stringify(merged);
    } catch {
      return '[Unserializable Context]';
    }
  }
}
