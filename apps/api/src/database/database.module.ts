import { DynamicModule, Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaDatabaseModule } from './prisma/module';
import { MongooseDatabaseModule } from './mongoose/module';

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
          MongooseModule.forRoot(process.env.DATABASE_URL_MONGODB!),
          MongooseDatabaseModule,
        ],
        exports: [MongooseDatabaseModule],
      };
    }

    return {
      global: true,
      module: DatabaseModule,
      imports: [PrismaDatabaseModule],
      exports: [PrismaDatabaseModule],
    };
  }
}
