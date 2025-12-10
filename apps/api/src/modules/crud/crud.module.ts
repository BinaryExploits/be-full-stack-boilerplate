import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from '../prisma/prisma.module';
import { CrudEntity, CrudSchema } from './entities/crud.entity';
import { CrudService } from './crud.service';
import { CrudRouter } from './crud.router';
import { CrudMongoRepository } from './repositories/mongoose/crud.mongo.repository';

@Module({
  imports: [
    PrismaModule,
    MongooseModule.forFeature([{ name: CrudEntity.name, schema: CrudSchema }]),
  ],
  providers: [CrudMongoRepository, CrudService, CrudRouter],
  exports: [CrudMongoRepository, CrudService],
})
export class CrudModule {}
