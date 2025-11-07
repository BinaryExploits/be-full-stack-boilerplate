import { ConsoleLogger, Global, Module } from '@nestjs/common';
import { RollbarService } from '@andeanwide/nestjs-rollbar';
import NestJsLogger from './logger-nestjs';
import { FlagExtensions, Logger, LogLevel } from '@repo/utils-core';

@Global()
@Module({
  providers: [
    {
      provide: NestJsLogger,
      useFactory: (rollbar: RollbarService) => {
        const consoleLogLevel: LogLevel = FlagExtensions.fromStringList(
          process.env.LOG_LEVELS,
          LogLevel,
        );

        const rollbarLogLevel = FlagExtensions.fromStringList(
          process.env.ROLLBAR_LOG_LEVELS,
          LogLevel,
        );

        const consoleLogger = new ConsoleLogger('App');
        const logger = new NestJsLogger(
          consoleLogLevel,
          rollbarLogLevel,
          'App',
          consoleLogger,
          rollbar,
        );

        Logger.setInstance(logger);
        return logger;
      },
      inject: [RollbarService],
    },
  ],
  exports: [NestJsLogger],
})
export class LoggerModule {}
