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
import { ServerConstants } from './constants/server.constants';
import { parseNodeEnvironment } from './lib/types/environment.type';
import { TenantModule } from './modules/tenant/tenant.module';
import { GlobalCrudModule } from './modules/global-crud/global-crud.module';

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
    TenantModule,
    MongooseModule.forRoot(process.env.DATABASE_URL_MONGODB!),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
      plugins: [
        new ClsPluginTransactional({
          connectionName: ServerConstants.TransactionConnectionNames.Mongoose,
          imports: [MongooseModule],
          adapter: new TransactionalAdapterMongoose({
            mongooseConnectionToken: getConnectionToken(),
          }),
        }),
        new ClsPluginTransactional({
          connectionName: ServerConstants.TransactionConnectionNames.Prisma,
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
      environment: parseNodeEnvironment(process.env.NODE_ENV),
    }),
    LoggerModule,
    CrudModule,
    GlobalCrudModule,
    EmailModule,
  ],
  controllers: [],
  providers: [AppContext],
})
export class AppModule implements NestModule {
  // noinspection JSUnusedGlobalSymbols
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*')
      .apply(TenantModule.resolutionMiddleware)
      .forRoutes('*');
  }
}
