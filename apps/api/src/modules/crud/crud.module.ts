import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from '../prisma/prisma.module';
import {
  CrudMongooseEntity,
  CrudMongooseSchema,
} from './repositories/mongoose/crud.mongoose-entity';
import { CrudService } from './crud.service';
import { CrudRouter } from './crud.router';
import { CrudMongooseRepository } from './repositories/mongoose/crud.mongoose-repository';

@Module({
  imports: [
    PrismaModule,
    MongooseModule.forFeature([
      { name: CrudMongooseEntity.name, schema: CrudMongooseSchema },
    ]),
  ],
  providers: [CrudMongooseRepository, CrudService, CrudRouter],
  exports: [CrudMongooseRepository, CrudService],
})
export class CrudModule {}
