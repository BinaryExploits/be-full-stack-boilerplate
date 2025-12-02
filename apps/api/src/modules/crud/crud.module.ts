import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from '../prisma/prisma.module';
import { CrudDocument, CrudSchema } from './models/crud.model';
import { CrudRepository } from './repositories/crud.repository';
import { CrudService } from './crud.service';
import { CrudRouter } from './crud.router';

@Module({
  imports: [
    PrismaModule,
    MongooseModule.forFeature([
      { name: CrudDocument.name, schema: CrudSchema },
    ]),
  ],
  providers: [CrudRepository, CrudService, CrudRouter],
  exports: [CrudRepository, CrudService],
})
export class CrudModule {}
