import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
    maxAge: 3600,
  });
  await app.listen(process.env.PORT ?? 4000);
}

bootstrap().catch((err) => {
  // Todo: Use Centralized Logger
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
