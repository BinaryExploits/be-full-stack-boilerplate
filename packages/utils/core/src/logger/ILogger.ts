import { LogLevel } from './LogLevel';

export interface LogContext {
  [key: string]: unknown;
}

export interface ILogger {
  log(level: LogLevel, message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  trace(message: string, context?: LogContext): void;
}
