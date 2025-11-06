import { Module, Global, ConsoleLogger } from '@nestjs/common';
import { RollbarService } from '@andeanwide/nestjs-rollbar';
import NestJsLogger from './logger-nestjs';
import { LogLevel, Logger, parseLogLevel } from '@repo/utils-core';

@Global()
@Module({
  providers: [
    {
      provide: NestJsLogger,
      useFactory: (rollbar: RollbarService) => {
        const levelMap: Record<string, LogLevel> = {
          ERROR: LogLevel.ERROR,
          WARN: LogLevel.WARN,
          INFO: LogLevel.INFO,
          DEBUG: LogLevel.DEBUG,
          TRACE: LogLevel.TRACE,
        };
        const logLevel = parseLogLevel(process.env.LOG_LEVEL!);
        const consoleLogger = new ConsoleLogger('App');
        const logger = new NestJsLogger(
          logLevel,
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
