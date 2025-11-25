import { DynamicModule, Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaDatabaseModule } from './prisma/prisma-database.module';
import { MongooseDatabaseModule } from './mongoose/mongoose-database.module';

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

    // Default to PostgreSQL with Prisma
    return {
      global: true,
      module: DatabaseModule,
      imports: [PrismaDatabaseModule],
      exports: [PrismaDatabaseModule],
    };
  }
}
