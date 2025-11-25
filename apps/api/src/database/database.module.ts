import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaDatabaseModule } from './prisma';
import { MongooseDatabaseModule } from './mongoose';

export type DbProvider = 'postgresql' | 'mongodb';

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const dbProvider = process.env.DB_PROVIDER as DbProvider;

    if (dbProvider === 'mongodb') {
      return {
        global: true,
        module: DatabaseModule,
        imports: [
          ConfigModule,
          MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              uri: configService.get<string>('DATABASE_URL_MONGODB'),
            }),
            inject: [ConfigService],
          }),
          MongooseDatabaseModule,
        ],
        exports: [MongooseDatabaseModule],
      };
    }

    // Default to PostgreSQL with Prisma
    return {
      global: true,
      module: DatabaseModule,
      imports: [PrismaDatabaseModule],
      exports: [PrismaDatabaseModule],
    };
  }
}
