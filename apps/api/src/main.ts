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

  Logger.instance.info(`Server is running on port ${port}`);
  Logger.instance.withContext('My Context').error('MY ERROR');
  Logger.instance.error('MY ERROR');

  // throw new Error('ERROR NO CAUSE');

  // throw new SyntaxError('ERROR WITH CAUSE', {
  //   cause: "I'm a cause",
  // });
}

bootstrap().catch((err: Error) => {
  Logger.instance
    .withContext(err.name)
    .error(
      err.message,
      err.stack,
      ...(err.cause ? ['Cause: ', err.cause] : []),
    );
  process.exit(1);
});
