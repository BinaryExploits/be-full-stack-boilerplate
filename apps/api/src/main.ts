import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@repo/utils-core';

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
}

bootstrap().catch((err: Error) => {
  Logger.instance.error('Failed to start server:', err);
  process.exit(1);
});
