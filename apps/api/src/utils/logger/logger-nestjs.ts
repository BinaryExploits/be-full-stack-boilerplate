import { ConsoleLogger } from '@nestjs/common';
import { RollbarService } from '@andeanwide/nestjs-rollbar';
import {
  BaseLogger,
  FlagExtensions,
  LogLevel,
  StringExtensions,
} from '@repo/utils-core';

class NestJsLogger extends BaseLogger {
  private readonly rollbarLogLevel: LogLevel;
  private readonly context: string;
  private readonly consoleLogger: ConsoleLogger;
  private readonly rollbar?: RollbarService;

  constructor(
    logLevel: LogLevel,
    rollbarLogLevel: LogLevel,
    context: string,
    consoleLogger: ConsoleLogger,
    rollbar?: RollbarService,
  ) {
    super(logLevel);
    this.rollbarLogLevel = rollbarLogLevel;
    this.context = context;
    this.consoleLogger = consoleLogger;
    this.rollbar = rollbar;

    this.consoleLogger.setContext(this.context);
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
  error(message: any, stack?: string, ...optionalParams: any[]): void;
  error(message: any, stack?: string, ...optionalParams: unknown[]): void {
    this.writeError(LogLevel.Error, message, stack, ...optionalParams);
  }

  critical(message: any): void;
  critical(message: any, ...optionalParams: any[]): void;
  critical(message: any, ...optionalParams: unknown[]): void {
    this.writeError(LogLevel.Critical, message, undefined, ...optionalParams);
  }

  private writeLog(
    level: LogLevel,
    message: any,
    ...optionalParams: unknown[]
  ): void {
    this.writeToConsole(level, message, ...optionalParams);
    this.sendToRollbar(level, message, ...optionalParams);
    this.clearTempContext();
  }

  private writeError(
    logLevel: LogLevel,
    message: any,
    stack?: string,
    ...optionalParams: unknown[]
  ): void {
    this.writeErrorToConsole(logLevel, message, stack, ...optionalParams);
    this.sendToRollbar(logLevel, message, stack, ...optionalParams);
    this.clearTempContext();
  }

  private writeToConsole(
    level: LogLevel,
    message: any,
    ...optionalParams: unknown[]
  ): void {
    if (!this.shouldLog(level)) return;

    const params: unknown[] = [
      ...optionalParams,
      ...(StringExtensions.IsNullOrEmpty(this.tempContext)
        ? [this.context]
        : [this.tempContext]),
    ];

    switch (level) {
      case LogLevel.Info:
        this.consoleLogger.log(message, ...params);
        break;
      case LogLevel.Warn:
        this.consoleLogger.warn(message, ...params);
        break;
      case LogLevel.Debug:
        this.consoleLogger.debug(message, ...params);
        break;
      case LogLevel.Trace:
        this.consoleLogger.verbose(message, ...params);
        break;
      default:
        break;
    }
  }

  private writeErrorToConsole(
    logLevel: LogLevel,
    message: any,
    stack?: string,
    ...optionalParams: unknown[]
  ) {
    if (!this.shouldLog(logLevel)) return;

    const context: string = StringExtensions.IsNullOrEmpty(this.tempContext)
      ? this.context
      : this.tempContext;

    if (StringExtensions.IsNullOrEmpty(stack)) {
      this.consoleLogger.error(message, context);
    } else {
      this.consoleLogger.error(message, ...optionalParams, stack, context);
    }
  }

  private shouldSendToRollbar(logLevel: LogLevel) {
    return FlagExtensions.has(this.rollbarLogLevel, logLevel);
  }

  private sendToRollbar(
    level: LogLevel,
    message: any,
    ...optionalParams: unknown[]
  ): void {
    if (!this.rollbar || !this.shouldSendToRollbar(level)) return;

    try {
      const data: string = JSON.stringify([
        ...(StringExtensions.IsNullOrEmpty(this.tempContext)
          ? [`[${this.context}]`]
          : [`[${this.tempContext}]`]),
        message,
        ...optionalParams,
      ]);

      switch (level) {
        case LogLevel.Info:
          this.rollbar.info(data);
          break;
        case LogLevel.Error:
          this.rollbar.error(data);
          break;
        case LogLevel.Warn:
          this.rollbar.warn(data);
          break;
        case LogLevel.Debug:
        case LogLevel.Trace:
          this.rollbar.log(data);
          break;
        case LogLevel.Critical:
          this.rollbar.critical(data);
          break;
      }
    } catch (err) {
      const error = err as Error;
      this.withContext('Rollbar').error(error.message, error.stack);
    }
  }
}

export default NestJsLogger;
