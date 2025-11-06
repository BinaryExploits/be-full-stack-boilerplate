import { ConsoleLogger } from '@nestjs/common';
import { RollbarService } from '@andeanwide/nestjs-rollbar';
import { BaseLogger, LogLevel, StringExtensions } from '@repo/utils-core';

class NestJsLogger extends BaseLogger {
  private readonly context: string;
  private readonly consoleLogger: ConsoleLogger;
  private readonly rollbar?: RollbarService;

  constructor(
    logLevel: LogLevel,
    context: string,
    consoleLogger: ConsoleLogger,
    rollbar?: RollbarService,
  ) {
    super(logLevel);

    this.context = context;
    this.consoleLogger = consoleLogger;
    this.rollbar = rollbar;

    this.consoleLogger.setContext(this.context);
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
  trace(message: any, ...optionalParams: any[]): void;
  trace(message: string, ...optionalParams: unknown[]): void {
    this.writeLog(LogLevel.TRACE, message, ...optionalParams);
  }

  error(message: any): void;
  error(message: any, stack: string, ...optionalParams: any[]): void;
  error(message: string, stack?: string, ...optionalParams: unknown[]): void {
    this.writeError(message, stack, ...optionalParams);
  }

  private writeLog(
    level: LogLevel,
    message: any,
    ...optionalParams: unknown[]
  ): void {
    if (!this.shouldLog(level)) return;

    this.routeToConsole(level, message, ...optionalParams);
    this.sendToRollbar(level, message, ...optionalParams);
    this.clearTempContext();
  }

  private writeError(
    message: any,
    stack?: string,
    ...optionalParams: unknown[]
  ): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const context = StringExtensions.IsNullOrEmpty(this.tempContext)
      ? this.context
      : this.tempContext;

    if (StringExtensions.IsNullOrEmpty(stack)) {
      this.consoleLogger.error(message, context);
    } else {
      this.consoleLogger.error(message, ...optionalParams, stack, context);
    }

    this.sendToRollbar(LogLevel.ERROR, message, stack, ...optionalParams);
    this.clearTempContext();
  }

  private routeToConsole(
    level: LogLevel,
    message: any,
    ...optionalParams: unknown[]
  ): void {
    const params: unknown[] = [
      ...optionalParams,
      ...(StringExtensions.IsNullOrEmpty(this.tempContext)
        ? [this.context]
        : [this.tempContext]),
    ];

    switch (level) {
      case LogLevel.INFO:
        this.consoleLogger.log(message, ...params);
        break;
      case LogLevel.WARN:
        this.consoleLogger.warn(message, ...params);
        break;
      case LogLevel.DEBUG:
        this.consoleLogger.debug(message, ...params);
        break;
      case LogLevel.TRACE:
        this.consoleLogger.verbose(message, ...params);
        break;
      default:
        break;
    }
  }

  private sendToRollbar(
    level: LogLevel,
    message: any,
    ...optionalParams: unknown[]
  ): void {
    if (!this.rollbar) return;

    try {
      const data: string = JSON.stringify([
        ...(StringExtensions.IsNullOrEmpty(this.tempContext)
          ? [`[${this.context}]`]
          : [`[${this.tempContext}]`]),
        message,
        ...optionalParams,
      ]);

      switch (level) {
        case LogLevel.INFO:
          this.rollbar.info(data);
          break;
        case LogLevel.ERROR:
          this.rollbar.error(data);
          break;
        case LogLevel.WARN:
          this.rollbar.warn(data);
          break;
        case LogLevel.DEBUG:
        case LogLevel.TRACE:
          this.rollbar.log(data);
          break;
      }
    } catch (err) {
      this.consoleLogger.error('Rollbar failed: ' + (err as Error).message);
    }
  }
}

export default NestJsLogger;
