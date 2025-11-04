import { ILogger } from './ILogger';

export class Logger {
  private static _instance: ILogger;

  static setInstance(logger: ILogger): void {
    Logger._instance = logger;
  }

  static get instance(): ILogger {
    if (!Logger._instance) {
      throw new Error('Logger instance not set. Call Logger.setInstance() at startup.');
    }

    return Logger._instance;
  }
}
