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
import { MongooseModule } from '@nestjs/mongoose';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from './modules/prisma/prisma.service';

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
        mount: true, // Mount CLS middleware globally
        generateId: true, // Generate request ID
        // Fix: Use proper type for tRPC compatibility
        idGenerator: (req) =>
          (req.headers as any)['x-request-id'] ?? crypto.randomUUID(),
      },
      plugins: [
        new ClsPluginTransactional({
          imports: [PrismaModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
          enableTransactionProxy: true, // Allows direct service injection
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
