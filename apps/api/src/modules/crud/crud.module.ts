import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from '../prisma/prisma.module';
import { CrudDocument, CrudSchema } from './models/crud.model';
import { CrudService } from './crud.service';
import { CrudRouter } from './crud.router';
import { CrudMongoRepository } from './repositories/mongoose/crud.mongo.repository';

@Module({
  imports: [
    PrismaModule,
    MongooseModule.forFeature([
      { name: CrudDocument.name, schema: CrudSchema },
    ]),
  ],
  providers: [CrudMongoRepository, CrudService, CrudRouter],
  exports: [CrudMongoRepository, CrudService],
})
export class CrudModule {}
