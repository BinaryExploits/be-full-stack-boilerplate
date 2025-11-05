import { ILogger } from "./ILogger";
import { LogLevel } from "./LogLevel";

export abstract class BaseLogger implements ILogger {
  public readonly logLevel: LogLevel;
  protected tempContext: string = "";

  protected constructor(logLevel: LogLevel) {
    this.logLevel = logLevel;
  }

  withContext(context: string): ILogger {
    this.tempContext = context;
    return this;
  }

  clearTempContext(): void {
    this.tempContext = "";
  }

  protected shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  abstract log(logLevel: LogLevel, message: any): void;
  abstract log(
    logLevel: LogLevel,
    message: any,
    ...optionalParams: any[]
  ): void;

  abstract info(message: any): void;
  abstract info(message: any, ...optionalParams: any[]): void;

  abstract warn(message: any): void;
  abstract warn(message: any, ...optionalParams: any[]): void;

  abstract debug(message: any): void;
  abstract debug(message: any, ...optionalParams: any[]): void;

  abstract trace(message: any): void;
  abstract trace(message: any, ...optionalParams: any[]): void;

  abstract error(message: any): void;
  abstract error(message: any, ...optionalParams: any[]): void;
}
