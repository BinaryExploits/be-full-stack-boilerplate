import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestJsLogger } from './utils/logger/NestJsLogger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(NestJsLogger);
  logger.setContext('Bootstrap');
  app.useLogger(logger);

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
    maxAge: 3600,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch((err: Error) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
