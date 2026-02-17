import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@repo/utils-core';
import { INestApplication } from '@nestjs/common';
import { matchesWildcard } from './lib/patterns/wildcard';

run().catch((err: Error) => {
  console.error(err);
  Logger.instance
    .withContext('Main.Run')
    .critical(
      'Failed to Create API Application',
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
      .withContext('Main.Run')
      .critical(
        'Application Crashed',
        error.stack,
        ...(error.cause ? ['Cause: ', error.cause] : []),
        error.message,
      );
  }
}

async function createNestApp() {
  return NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  });
}

function bootstrap(app: INestApplication) {
  const corsPatterns: string[] = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);
      callback(
        null,
        corsPatterns.some((p) => matchesWildcard(origin, p)),
      );
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, x-tenant-origin',
    maxAge: 3600,
  });
}
