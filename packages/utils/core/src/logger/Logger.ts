import { ILogger } from "./ILogger";
import { NoopLogger } from "./NoopLogger";
import { LogLevel } from "./LogLevel";

export class Logger {
  private static _instance: ILogger;

  static setInstance(logger: ILogger): void {
    Logger._instance = logger;
  }

  static get instance(): ILogger {
    if (!Logger._instance) {
      Logger.setInstance(new NoopLogger(LogLevel.INFO));
    }

    return Logger._instance;
  }
}
