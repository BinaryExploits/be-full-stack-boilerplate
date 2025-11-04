import { ILogger } from './ILogger';
import { DefaultLogger } from "./DefaultLogger";

export class Logger {
  private static _instance: ILogger;

  static setInstance(logger: ILogger): void {
    Logger._instance = logger;
  }

  static get instance(): ILogger {
    if (!Logger._instance) {
      Logger.setInstance(new DefaultLogger());
    }

    return Logger._instance;
  }
}
