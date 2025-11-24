import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { TRPCModule } from 'nestjs-trpc';
import { CrudModule } from './crud/crud.module';
import { AppContext } from './app.context';
import { RollbarModule } from '@andeanwide/nestjs-rollbar';
import { LoggerModule } from './utils/logger/logger.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { trpcErrorFormatter } from './trpc/trpc-error-formatter';
import { DatabaseModule } from './database';

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
    DatabaseModule.forRoot(),
    AuthModule,
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
    EmailModule,
  ],
  controllers: [],
  providers: [AppContext],
})
export class AppModule implements NestModule {
  // noinspection JSUnusedGlobalSymbols
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
