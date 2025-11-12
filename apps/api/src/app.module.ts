import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { TRPCModule } from 'nestjs-trpc';
import { CrudModule } from './crud/crud.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppContext } from './app.context';
import { RollbarModule } from '@andeanwide/nestjs-rollbar';
import { LoggerModule } from './utils/logger/logger.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { trpcErrorFormatter } from './trpc/trpc-error-formatter';
import { createBetterAuth } from './auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TRPCModule.forRoot({
      autoSchemaFile: '../../packages/trpc/src/server',
      context: AppContext,
      errorFormatter: trpcErrorFormatter,
    }),
    AuthModule.forRoot({ auth: createBetterAuth() }),
    RollbarModule.register({
      accessToken: process.env.ROLLBAR_ACCESS_TOKEN!,
      // @ts-expect-error (rollbar config allow any string)
      environment:
        (process.env.NODE_ENV as
          | 'development'
          | 'production'
          | 'staging'
          | 'testing') || 'development',
    }),
    LoggerModule,
    CrudModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [AppContext],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
