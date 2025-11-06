import { ILogger } from "./logger.interface";
import { LogLevel } from "./log-level";
import { FlagExtensions } from "../extensions";

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
    return FlagExtensions.has(this.logLevel, level);
  }

  abstract info(message: any): void;
  abstract info(message: any, ...optionalParams: any[]): void;

  abstract warn(message: any): void;
  abstract warn(message: any, ...optionalParams: any[]): void;

  abstract debug(message: any): void;
  abstract debug(message: any, ...optionalParams: any[]): void;

  abstract trace(message: any): void;
  abstract trace(message: any, ...optionalParams: any[]): void;

  abstract error(message: any): void;
  abstract error(message: any, stack?: string, ...optionalParams: any[]): void;

  abstract critical(message: any): void;
  abstract critical(message: any, ...optionalParams: any[]): void;
}
