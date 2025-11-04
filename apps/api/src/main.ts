import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@repo/utils-core';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
    maxAge: 3600,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  const consoleLogger = app.get(ConsoleLogger);
  logAll(consoleLogger);
}

bootstrap().catch((err: Error) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

function logAll(consoleLogger: ConsoleLogger) {
  console.log('--- Node Console ---');
  console.log('Hello World', 'Param1', { param2: 'Param2' });
  console.info('Hello World', 'Param1', { param2: 'Param2' });
  console.warn('Hello World', 'Param1', { param2: 'Param2' });
  console.debug('Hello World', 'Param1', { param2: 'Param2' });
  console.error('Hello World', 'Param1', { param2: 'Param2' });
  console.trace('Hello World', 'Param1', { param2: 'Param2' });
  console.log('-----------------');

  consoleLogger.log('--- Console Logger ---');
  const param1 = 'Param1';
  const param2 = 'Param2';
  consoleLogger.log(param1 + ' ' + param2);
  consoleLogger.log(param1, param2);
  consoleLogger.log('Hello World', 'Param1', { param2: 'Param2' });
  consoleLogger.warn('Hello World', 'Param1', { param2: 'Param2' });
  consoleLogger.debug('Hello World', 'Param1', { param2: 'Param2' });
  consoleLogger.error('Hello World', 'Param1', { param2: 'Param2' });
  consoleLogger.verbose('Hello World', 'Param1', { param2: 'Param2' });
  consoleLogger.log('-----------------');

  Logger.instance.info('--- Our Logger ---');
  Logger.instance.info('Hello World', 'Param1', { param2: 'Param2' });
  Logger.instance.info('Hello World', 'Param1', { param2: 'Param2' });
  Logger.instance.warn('Hello World', 'Param1', { param2: 'Param2' });
  Logger.instance.debug('Hello World', 'Param1', { param2: 'Param2' });
  Logger.instance.error('Hello World', 'Param1', { param2: 'Param2' });
  Logger.instance.trace('Hello World', 'Param1', { param2: 'Param2' });
  Logger.instance.info('-----------------');
}
