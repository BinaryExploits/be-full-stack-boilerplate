import { LogLevel } from './LogLevel';
import { ILogger, LogContext } from './ILogger';

/**
 * Global static proxy for any logger implementation.
 * This allows usage like:
 *   Logger.info('message')
 *   Logger.withContext('UserService').debug('...')
 */
export class Logger {
  private static _instance: ILogger;

  /**
   * Set the active logger implementation (e.g., NestJsLogger)
   */
  static setInstance(logger: ILogger): void {
    Logger._instance = logger;
  }

  /**
   * Get the current logger instance
   */
  static get instance(): ILogger {
    if (!Logger._instance) {
      throw new Error('Logger instance not set. Call Logger.setInstance() at startup.');
    }
    return Logger._instance;
  }

  /**
   * Create a scoped logger that automatically adds a static context
   */
  static withContext(contextName: string): ILogger {
    const base = Logger.instance;

    return {
      log: (level: LogLevel, message: string, context?: LogContext): void => {
        base.log(level, message, { logger: contextName, ...context });
      },
      info: (message: string, context?: LogContext): void => {
        base.info(message, { logger: contextName, ...context });
      },
      warn: (message: string, context?: LogContext): void => {
        base.warn(message, { logger: contextName, ...context });
      },
      error: (message: string, context?: LogContext): void => {
        base.error(message, { logger: contextName, ...context });
      },
      debug: (message: string, context?: LogContext): void => {
        base.debug(message, { logger: contextName, ...context });
      },
      trace: (message: string, context?: LogContext): void => {
        base.trace(message, { logger: contextName, ...context });
      },
    };
  }

  // Global static convenience methods
  static log(level: LogLevel, message: string, context?: LogContext): void {
    Logger.instance.log(level, message, context);
  }
  static info(message: string, context?: LogContext): void {
    Logger.instance.info(message, context);
  }
  static warn(message: string, context?: LogContext): void {
    Logger.instance.warn(message, context);
  }
  static error(message: string, context?: LogContext): void {
    Logger.instance.error(message, context);
  }
  static debug(message: string, context?: LogContext): void {
    Logger.instance.debug(message, context);
  }
  static trace(message: string, context?: LogContext): void {
    Logger.instance.trace(message, context);
  }
}
