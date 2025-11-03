import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { TRPCModule } from 'nestjs-trpc';
import { CrudModule } from './crud/crud.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppContext } from './app.context';
import { RollbarModule } from '@andeanwide/nestjs-rollbar';
import { LoggerModule } from './utils/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RollbarModule.register({
      accessToken: '0d7e809765d14a738057066134fa09bc',
      environment: 'development',
    }),
    LoggerModule,
    TRPCModule.forRoot({
      autoSchemaFile: '../../packages/trpc/src/server',
      context: AppContext,
    }),
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
