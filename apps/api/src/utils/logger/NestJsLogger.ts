import { LoggerService } from '@nestjs/common';
import { BaseLogger, LogLevel, LogContext } from '@repo/utils-core';

/**
 * NestJS-specific logger implementation that extends BaseLogger and implements LoggerService.
 * This logger can be used as a drop-in replacement for NestJS's built-in logger.
 */
export class NestJsLogger extends BaseLogger implements LoggerService {
  private context?: string;

  constructor(context?: string, initialLogLevel: LogLevel = LogLevel.INFO) {
    super(initialLogLevel);
    this.context = context;
  }

  /**
   * Set the context for this logger instance
   * @param context The context string (usually the class name)
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * NestJS LoggerService compatibility method
   */
  log(message: string, context?: string): void;
  log(level: LogLevel, message: string, context?: LogContext): void;
  log(
    messageOrLevel: string | LogLevel,
    contextOrMessage?: string | LogContext,
    maybeContext?: LogContext,
  ): void {
    // Handle BaseLogger.log(level, message, context) signature
    if (typeof messageOrLevel === 'number') {
      super.log(messageOrLevel, contextOrMessage as string, maybeContext);
      return;
    }

    // Handle NestJS LoggerService.log(message, context) signature
    const message = messageOrLevel;
    const ctx = contextOrMessage as string | undefined;
    this.info(message, { context: ctx || this.context });
  }

  /**
   * NestJS LoggerService compatibility method for errors
   */
  error(message: string, trace?: string, context?: string): void;
  error(message: string, context?: LogContext): void;
  error(
    message: string,
    traceOrContext?: string | LogContext,
    context?: string,
  ): void {
    // Handle case where second param is trace (string) and the third is context
    if (typeof traceOrContext === 'string') {
      const logContext: LogContext = {
        context: context || this.context,
        trace: traceOrContext,
      };
      super.error(message, logContext);
      return;
    }

    // Handle case where second param is a context object
    const logContext = {
      context: this.context,
      ...traceOrContext,
    };
    super.error(message, logContext);
  }

  /**
   * NestJS LoggerService compatibility method for warnings
   */
  warn(message: string, context?: string): void;
  warn(message: string, context?: LogContext): void;
  warn(message: string, contextOrObj?: string | LogContext): void {
    if (typeof contextOrObj === 'string') {
      super.warn(message, { context: contextOrObj || this.context });
      return;
    }
    const logContext = {
      context: this.context,
      ...contextOrObj,
    };
    super.warn(message, logContext);
  }

  /**
   * NestJS LoggerService compatibility method for debug
   */
  debug(message: string, context?: string): void;
  debug(message: string, context?: LogContext): void;
  debug(message: string, contextOrObj?: string | LogContext): void {
    if (typeof contextOrObj === 'string') {
      super.debug(message, { context: contextOrObj || this.context });
      return;
    }
    const logContext = {
      context: this.context,
      ...contextOrObj,
    };
    super.debug(message, logContext);
  }

  /**
   * NestJS LoggerService compatibility method for verbose (maps to trace)
   */
  verbose(message: string, context?: string): void;
  verbose(message: string, context?: LogContext): void;
  verbose(message: string, contextOrObj?: string | LogContext): void {
    if (typeof contextOrObj === 'string') {
      super.trace(message, { context: contextOrObj || this.context });
      return;
    }
    const logContext = {
      context: this.context,
      ...contextOrObj,
    };
    super.trace(message, logContext);
  }

  /**
   * NestJS LoggerService compatibility method (maps to trace)
   */
  fatal(message: string, context?: string): void;
  fatal(message: string, context?: LogContext): void;
  fatal(message: string, contextOrObj?: string | LogContext): void {
    if (typeof contextOrObj === 'string') {
      super.error(message, {
        context: contextOrObj || this.context,
        fatal: true,
      });
      return;
    }
    const logContext = {
      context: this.context,
      fatal: true,
      ...contextOrObj,
    };
    super.error(message, logContext);
  }

  /**
   * Implementation of the abstract writeLog method
   */
  protected writeLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): void {
    const formattedMessage = this.formatMessage(level, message);
    const formattedContext = this.formatContext(context);
    const fullMessage = formattedMessage + formattedContext;

    // Use console methods appropriate for each log level
    switch (level) {
      case LogLevel.ERROR:
        console.error(fullMessage);
        break;
      case LogLevel.WARN:
        console.warn(fullMessage);
        break;
      case LogLevel.INFO:
        console.info(fullMessage);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.debug(fullMessage);
        break;
      default:
        console.log(fullMessage);
    }
  }
}
