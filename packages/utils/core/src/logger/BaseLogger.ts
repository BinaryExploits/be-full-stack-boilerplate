import { ILogger, LogContext } from './ILogger';
import { LogLevel, getLogLevelName } from './LogLevel';

/**
 * Base logger implementation that provides core logging functionality.
 * This class is framework-agnostic and can be extended by specific logger implementations.
 */
export abstract class BaseLogger implements ILogger {
  protected currentLogLevel: LogLevel;

  protected constructor(initialLogLevel: LogLevel = LogLevel.INFO) {
    this.currentLogLevel = initialLogLevel;
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
   * Log an error message
   */
  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log a trace message
   */
  trace(message: string, context?: LogContext): void {
    this.log(LogLevel.TRACE, message, context);
  }

  /**
   * Log a message at a specific level
   * @param level The log level
   * @param message The message to log
   * @param context Optional context object
   */
  log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) {
      return;
    }

    this.writeLog(level, message, context);
  }

  /**
   * Abstract method that must be implemented by subclasses to actually write the log.
   * This is where framework-specific implementations will handle the actual logging.
   * @param level The log level
   * @param message The message to log
   * @param context Optional context object
   */
  protected abstract writeLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): void;

  /**
   * Format a log message with timestamp and level
   * @param level The log level
   * @param message The message to format
   */
  protected formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const levelName = getLogLevelName(level);
    return `[${timestamp}] [${levelName}] ${message}`;
  }

  /**
   * Format context for logging
   * @param context The context to format
   */
  protected formatContext(context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) {
      return '';
    }
    return ` ${JSON.stringify(context)}`;
  }
}
