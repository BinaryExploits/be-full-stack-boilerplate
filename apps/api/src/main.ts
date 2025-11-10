import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@repo/utils-core';
import { INestApplication } from '@nestjs/common';

run().catch((err: Error) => {
  console.error(err);
  Logger.instance
    .withContext('Main.Run')
    .critical(
      'Failed to start Platform API',
      err.stack,
      ...(err.cause ? ['Cause: ', err.cause] : []),
      err.message,
    );

  process.exit(1);
});

async function run() {
  const app: INestApplication<any> = await createNestApp();

  try {
    bootstrap(app);

    const port: string | 4000 = process.env.PORT ?? 4000;
    await app.listen(port);

    Logger.instance.info(`Server is running on port ${port}`);
  } catch (err) {
    console.error(err);
    const error = err as Error;
    Logger.instance
      .withContext('App')
      .critical(
        'Application Crashed',
        error.stack,
        ...(error.cause ? ['Cause: ', error.cause] : []),
        error.message,
      );
  }
}

async function createNestApp() {
  return NestFactory.create(AppModule);
}

function bootstrap(app: INestApplication<any>) {
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
    maxAge: 3600,
  });
}
