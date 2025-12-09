import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { TRPCModule } from 'nestjs-trpc';
import { CrudModule } from './modules/crud/crud.module';
import { AppContext } from './app.context';
import { RollbarModule } from '@andeanwide/nestjs-rollbar';
import { LoggerModule } from './modules/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { trpcErrorFormatter } from './trpc/trpc-error-formatter';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterMongoose } from '@nestjs-cls/transactional-adapter-mongoose';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

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
    PrismaModule,
    MongooseModule.forRoot(process.env.DATABASE_URL_MONGODB!),
    // Add ClsModule with Transactional Plugin
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
      plugins: [
        new ClsPluginTransactional({
          connectionName: 'MONGOOSE_CONNECTION',
          imports: [
            // module in which the Connection instance is provided
            MongooseModule,
          ],
          adapter: new TransactionalAdapterMongoose({
            // the injection token of the mongoose Connection
            mongooseConnectionToken: getConnectionToken(),
          }),
        }),
        new ClsPluginTransactional({
          connectionName: PrismaModule.name,
          imports: [PrismaModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
          enableTransactionProxy: true,
        }),
      ],
    }),
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
