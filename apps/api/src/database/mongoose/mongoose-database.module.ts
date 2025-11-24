import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrudDocument, CrudSchema } from './schemas/crud.schema';
import { CrudMongooseRepository } from './repositories/crud.mongoose.repository';
import { CRUD_REPOSITORY } from '../interfaces';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CrudDocument.name, schema: CrudSchema },
    ]),
  ],
  providers: [
    {
      provide: CRUD_REPOSITORY,
      useClass: CrudMongooseRepository,
    },
  ],
  exports: [CRUD_REPOSITORY],
})
export class MongooseDatabaseModule {}
