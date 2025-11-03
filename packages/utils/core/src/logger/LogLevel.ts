/**
 * Log levels in order of severity (highest to lowest).
 * When a log level is set, only messages at that level or higher will be logged.
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

/**
 * Helper to convert string to LogLevel
 */
export function parseLogLevel(level: string): LogLevel {
  const upperLevel = level.toUpperCase();
  switch (upperLevel) {
    case 'ERROR':
      return LogLevel.ERROR;
    case 'WARN':
    case 'WARNING':
      return LogLevel.WARN;
    case 'INFO':
      return LogLevel.INFO;
    case 'DEBUG':
      return LogLevel.DEBUG;
    case 'TRACE':
      return LogLevel.TRACE;
    default:
      return LogLevel.INFO;
  }
}

/**
 * Helper to get log level name
 */
export function getLogLevelName(level: LogLevel): string {
  switch (level) {
    case LogLevel.ERROR:
      return 'ERROR';
    case LogLevel.WARN:
      return 'WARN';
    case LogLevel.INFO:
      return 'INFO';
    case LogLevel.DEBUG:
      return 'DEBUG';
    case LogLevel.TRACE:
      return 'TRACE';
    default:
      return 'UNKNOWN';
  }
}
