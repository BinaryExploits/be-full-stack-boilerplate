export enum LogLevel {
  UNDEFINED = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5,
}

export function parseLogLevel(level: string): LogLevel {
  const upperLevel = level.toUpperCase();
  switch (upperLevel) {
    case "ERROR":
      return LogLevel.ERROR;
    case "WARN":
      return LogLevel.WARN;
    case "INFO":
      return LogLevel.INFO;
    case "DEBUG":
      return LogLevel.DEBUG;
    case "TRACE":
      return LogLevel.TRACE;
    default:
      return LogLevel.UNDEFINED;
  }
}

export function getLogLevelName(level: LogLevel): string {
  switch (level) {
    case LogLevel.ERROR:
      return "ERROR";
    case LogLevel.WARN:
      return "WARN";
    case LogLevel.INFO:
      return "INFO";
    case LogLevel.DEBUG:
      return "DEBUG";
    case LogLevel.TRACE:
      return "TRACE";
    default:
      return "UNDEFINED";
  }
}
