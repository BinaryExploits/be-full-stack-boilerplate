import { Logger } from '@repo/utils-core';

export class BetterAuthLogger {
  authContext: string = 'Better Auth';

  log(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    ...args: unknown[]
  ) {
    message = message.trim();
    switch (level) {
      case 'info':
        Logger.instance.withContext(this.authContext).info(message, ...args);
        break;
      case 'warn':
        Logger.instance.withContext(this.authContext).warn(message, ...args);
        break;
      case 'error':
        Logger.instance
          .withContext(this.authContext)
          .critical(message, ...args);
        break;
      case 'debug':
        Logger.instance.withContext(this.authContext).debug(message, ...args);
        break;
    }
  }
}
