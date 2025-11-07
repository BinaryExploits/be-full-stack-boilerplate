import { ILogger } from "./logger.interface";
import { NoopLogger } from "./noop-logger";
import { LogLevel } from "./log-level";

export class Logger {
  private static _instance: ILogger;

  static setInstance(logger: ILogger): void {
    Logger._instance = logger;
  }

  static get instance(): ILogger {
    if (!Logger._instance) {
      Logger.setInstance(NoopLogger.create(LogLevel.None));
    }

    return Logger._instance;
  }
}
