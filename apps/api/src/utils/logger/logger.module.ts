import { Module, Global } from '@nestjs/common';
import { NestJsLogger } from './NestJsLogger';
import { LogLevel } from '@repo/utils-core';
import { RollbarService } from '@andeanwide/nestjs-rollbar';

/**
 * Global logger module that provides the NestJsLogger throughout the application.
 * This module is marked as @Global(), so you don't need to import it in every module.
 * The logger can be injected anywhere using standard NestJS dependency injection.
 */
@Global()
@Module({
  providers: [
    {
      provide: NestJsLogger,
      useFactory: (rollbar: RollbarService) => {
        const logLevelString = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
        const logLevelMap: Record<string, LogLevel> = {
          ERROR: LogLevel.ERROR,
          WARN: LogLevel.WARN,
          INFO: LogLevel.INFO,
          DEBUG: LogLevel.DEBUG,
          TRACE: LogLevel.TRACE,
        };

        const logLevel = logLevelMap[logLevelString] || LogLevel.INFO;
        return new NestJsLogger(rollbar, 'App', logLevel);
      },
      inject: [RollbarService],
    },
  ],
  exports: [NestJsLogger],
})
export class LoggerModule {}
