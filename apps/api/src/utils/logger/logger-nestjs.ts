import { ConsoleLogger } from '@nestjs/common';
import { RollbarService } from '@andeanwide/nestjs-rollbar';
import { LogLevel, BaseLogger } from '@repo/utils-core';

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
    this.info(`NestJsLogger initialized (Rollbar: ${!!rollbar})`);
    this.info(`NestJsLogger initialized (Rollbar: ${!!rollbar})`, 'Param 2');
    this.info(`NestJsLogger initialized (Rollbar: ${!!rollbar})`, 'Param 2', {
      content: 'content',
    });

    this.withContext(NestJsLogger.name).info(
      `NestJsLogger initialized (Rollbar: ${!!rollbar})`,
    );
    this.withContext(NestJsLogger.name).info(
      `NestJsLogger initialized (Rollbar: ${!!rollbar})`,
      'Param 2',
    );
    this.withContext(NestJsLogger.name).info(
      `NestJsLogger initialized (Rollbar: ${!!rollbar})`,
      'Param 2',
      {
        content: 'content',
      },
    );
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
    level: LogLevel,
    message: any,
    ...optionalParams: unknown[]
  ): void {
    if (!this.shouldLog(level)) return;

    this.routeToConsole(level, message, ...optionalParams);
    this.sendToRollbar(level, message, ...optionalParams);
  }

  private routeToConsole(
    level: LogLevel,
    message: any,
    ...optionalParams: unknown[]
  ): void {
    const params: unknown[] = [
      ...optionalParams,
      ...(this.tempContext.trim() !== '' ? [this.tempContext] : [this.context]),
    ];

    switch (level) {
      case LogLevel.INFO:
        this.consoleLogger.log(message, ...params);
        break;
      case LogLevel.ERROR:
        this.consoleLogger.error(message, ...params);
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
        ...(this.tempContext.trim() !== ''
          ? [`[${this.tempContext}]`]
          : [`[${this.context}]`]),
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
        //   this.rollbar.critical(data); // capture exceptions in our exception handler and send to Rollbar
        //   break;
      }
    } catch (err) {
      this.consoleLogger.error('Rollbar failed: ' + (err as Error).message);
    }
  }
}

export default NestJsLogger;
