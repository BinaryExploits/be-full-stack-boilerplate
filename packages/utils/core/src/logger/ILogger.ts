import { LogLevel } from './LogLevel';

/**
 * Context object that can be attached to log messages
 */
export interface LogContext {
  [key: string]: unknown;
}

/**
 * Core logger interface that all logger implementations must implement.
 * This interface is framework-agnostic and can be used across different platforms.
 */
export interface ILogger {
  /**
   * Get the current log level
   */
  getLogLevel(): LogLevel;

  /**
   * Set the log level
   * @param level The log level to set
   */
  setLogLevel(level: LogLevel): void;

  /**
   * Check if a message at the given level should be logged
   * @param level The log level to check
   */
  shouldLog(level: LogLevel): boolean;

  /**
   * Log an error message
   * @param message The message to log
   * @param context Optional context object
   */
  error(message: string, context?: LogContext): void;

  /**
   * Log a warning message
   * @param message The message to log
   * @param context Optional context object
   */
  warn(message: string, context?: LogContext): void;

  /**
   * Log an info message
   * @param message The message to log
   * @param context Optional context object
   */
  info(message: string, context?: LogContext): void;

  /**
   * Log a debug message
   * @param message The message to log
   * @param context Optional context object
   */
  debug(message: string, context?: LogContext): void;

  /**
   * Log a trace message
   * @param message The message to log
   * @param context Optional context object
   */
  trace(message: string, context?: LogContext): void;

  /**
   * Log a message at a specific level
   * @param level The log level
   * @param message The message to log
   * @param context Optional context object
   */
  log(level: LogLevel, message: string, context?: LogContext): void;
}
