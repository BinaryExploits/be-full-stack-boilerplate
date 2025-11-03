import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ILogger, LogLevel, LogContext } from '@repo/utils-core';
import { RollbarService } from '@andeanwide/nestjs-rollbar';

/**
 * NestJS-specific logger implementation that extends NestJS ConsoleLogger and implements ILogger.
 * This logger acts as a wrapper around NestJS's ConsoleLogger with your custom contract.
 * It can be used as a drop-in replacement for NestJS's built-in logger while maintaining
 * compatibility with the ILogger interface.
 */
@Injectable()
export class NestJsLogger extends ConsoleLogger implements ILogger {
  private currentLogLevel: LogLevel;

  constructor(
    private readonly rollbar?: RollbarService,
    context?: string,
    initialLogLevel: LogLevel = LogLevel.INFO,
  ) {
    super(context || '');
    this.currentLogLevel = initialLogLevel;

    this.log('Rollbar IsEnabled: ' + (rollbar ? 'true' : 'false'));
  }

  /**
   * Get the current log level
   */
  getLogLevel(): LogLevel {
    return this.currentLogLevel;
  }

  /**
   * Set the log level
   * @param level The log level to set
   */
  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  /**
   * Check if a message at the given level should be logged
   * @param level The log level to check
   */
  shouldLog(level: LogLevel): boolean {
    return level <= this.currentLogLevel;
  }

  /**
   * Log a message at a specific level (ILogger interface)
   * @param level The log level
   * @param message The message to log
   * @param context Optional context object
   */
  log(level: LogLevel, message: string, context?: LogContext): void;
  /**
   * Log a message (NestJS Logger compatibility)
   * @param message The message to log
   * @param context Optional context string
   */
  log(message: any, context?: string): void;
  log(
    messageOrLevel: string | LogLevel,
    contextOrMessage?: string | LogContext,
    maybeContext?: LogContext,
  ): void {
    // Handle ILogger.log(level, message, context) signature
    if (typeof messageOrLevel === 'number') {
      const level = messageOrLevel;
      const message = contextOrMessage as string;
      const context = maybeContext;

      if (!this.shouldLog(level)) {
        return;
      }

      // Send to Rollbar
      this.sendToRollbar(level, message, context);

      // Map LogLevel to NestJS Logger methods
      const formattedContext = this.formatLogContext(context);
      switch (level) {
        case LogLevel.ERROR:
          formattedContext
            ? super.error(message, formattedContext)
            : super.error(message);
          break;
        case LogLevel.WARN:
          formattedContext
            ? super.warn(message, formattedContext)
            : super.warn(message);
          break;
        case LogLevel.INFO:
          formattedContext
            ? super.log(message, formattedContext)
            : super.log(message);
          break;
        case LogLevel.DEBUG:
          formattedContext
            ? super.debug(message, formattedContext)
            : super.debug(message);
          break;
        case LogLevel.TRACE:
          formattedContext
            ? super.verbose(message, formattedContext)
            : super.verbose(message);
          break;
        default:
          formattedContext
            ? super.log(message, formattedContext)
            : super.log(message);
      }
      return;
    }

    // Handle NestJS Logger.log(message, context) signature
    if (!this.shouldLog(LogLevel.INFO)) {
      return;
    }

    // Send to Rollbar
    this.sendToRollbar(LogLevel.INFO, messageOrLevel);

    // Only pass context if it's defined and is a string
    if (contextOrMessage && typeof contextOrMessage === 'string') {
      super.log(messageOrLevel, contextOrMessage);
    } else {
      super.log(messageOrLevel);
    }
  }

  /**
   * Log an error message (ILogger interface)
   */
  error(message: string, context?: LogContext): void;
  /**
   * Log an error message (NestJS Logger compatibility)
   */
  error(message: any, stack?: string, context?: string): void;
  error(
    message: string,
    stackOrContext?: string | LogContext,
    context?: string,
  ): void {
    if (!this.shouldLog(LogLevel.ERROR)) {
      return;
    }

    // Handle NestJS signature: error(message, stack, context)
    if (typeof stackOrContext === 'string') {
      // Send to Rollbar with stack trace
      this.sendToRollbar(LogLevel.ERROR, message, {
        stack: stackOrContext,
        context,
      });
      super.error(message, stackOrContext, context);
      return;
    }

    // Handle ILogger signature: error(message, context)
    this.sendToRollbar(LogLevel.ERROR, message, stackOrContext);
    const formattedContext = this.formatLogContext(stackOrContext);
    formattedContext
      ? super.error(message, formattedContext)
      : super.error(message);
  }

  /**
   * Log a warning message (ILogger interface)
   */
  warn(message: string, context?: LogContext): void;
  /**
   * Log a warning message (NestJS Logger compatibility)
   */
  warn(message: any, context?: string): void;
  warn(message: string, contextOrObj?: string | LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) {
      return;
    }

    // Send to Rollbar
    this.sendToRollbar(
      LogLevel.WARN,
      message,
      typeof contextOrObj === 'object' ? contextOrObj : undefined,
    );

    if (typeof contextOrObj === 'string') {
      super.warn(message, contextOrObj);
      return;
    }

    const formattedContext = this.formatLogContext(contextOrObj);
    formattedContext
      ? super.warn(message, formattedContext)
      : super.warn(message);
  }

  /**
   * Log an info message (ILogger interface)
   * This maps to NestJS's log method
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) {
      return;
    }

    // Send to Rollbar
    this.sendToRollbar(LogLevel.INFO, message, context);

    const formattedContext = this.formatLogContext(context);
    formattedContext
      ? super.log(message, formattedContext)
      : super.log(message);
  }

  /**
   * Log a debug message (ILogger interface)
   */
  debug(message: string, context?: LogContext): void;
  /**
   * Log a debug message (NestJS Logger compatibility)
   */
  debug(message: any, context?: string): void;
  debug(message: string, contextOrObj?: string | LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) {
      return;
    }

    // Send to Rollbar
    this.sendToRollbar(
      LogLevel.DEBUG,
      message,
      typeof contextOrObj === 'object' ? contextOrObj : undefined,
    );

    if (typeof contextOrObj === 'string') {
      super.debug(message, contextOrObj);
      return;
    }

    const formattedContext = this.formatLogContext(contextOrObj);
    formattedContext
      ? super.debug(message, formattedContext)
      : super.debug(message);
  }

  /**
   * Log a trace message (ILogger interface)
   * This maps to NestJS's verbose method
   */
  trace(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.TRACE)) {
      return;
    }

    // Send to Rollbar
    this.sendToRollbar(LogLevel.TRACE, message, context);

    const formattedContext = this.formatLogContext(context);
    formattedContext
      ? super.verbose(message, formattedContext)
      : super.verbose(message);
  }

  /**
   * Send log to Rollbar based on log level
   * @param level The log level
   * @param message The message to log
   * @param context Optional context object
   */
  private sendToRollbar(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): void {
    if (!this.rollbar) {
      return;
    }

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
          // Rollbar doesn't have trace, use debug
          this.rollbar.critical(message, context);
          break;
        default:
          this.rollbar.log(message, context);
      }
    } catch (error) {
      // If Rollbar fails, don't break the logging
      console.error('Failed to send log to Rollbar:', error);
    }
  }

  /**
   * Format context for logging
   * @param context The context to format
   */
  private formatLogContext(context?: LogContext): string | undefined {
    if (!context || Object.keys(context).length === 0) {
      return undefined;
    }
    return JSON.stringify(context);
  }
}
