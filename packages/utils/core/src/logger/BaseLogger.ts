import { ILogger } from "./ILogger";
import { LogLevel } from "./LogLevel";

export abstract class BaseLogger implements ILogger {
  public readonly logLevel: LogLevel;

  protected constructor(logLevel: LogLevel) {
    this.logLevel = logLevel;
  }

  shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  abstract debug(message: any): void;
  abstract debug(message: any, ...optionalParams: any[]): void;

  abstract error(message: any): void;
  abstract error(message: any, ...optionalParams: any[]): void;

  abstract info(message: any): void;
  abstract info(message: any, ...optionalParams: any[]): void;

  abstract log(logLevel: LogLevel, message: any): void;
  abstract log(
    logLevel: LogLevel,
    message: any,
    ...optionalParams: any[]
  ): void;

  abstract trace(message: any): void;
  abstract trace(message: any, context: string, ...optionalParams: any[]): void;
  abstract trace(message: any, ...optionalParams: any[]): void;

  abstract warn(message: any): void;
  abstract warn(message: any, ...optionalParams: any[]): void;
}
