import { BaseLogger } from './BaseLogger';
import { LogLevel } from './LogLevel';
import { LogContext } from './ILogger';

/**
 * Default logger implementation that works with pure TypeScript.
 * This logger is framework-agnostic and uses console methods for output.
 * It can be used in any environment that supports a console (Node.js, browser, etc.)
 */
export class DefaultLogger extends BaseLogger {
  constructor(initialLogLevel: LogLevel = LogLevel.INFO) {
    super(initialLogLevel);
  }

  /**
   * Implementation of the abstract writeLog method.
   * Uses console methods appropriate for each log level.
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
