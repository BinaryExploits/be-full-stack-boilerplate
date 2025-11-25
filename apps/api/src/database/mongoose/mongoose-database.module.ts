import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrudDocument, CrudSchema } from './models/crud.model';
import { CrudMongooseRepository } from './repositories/crud.mongoose.repository';
import { CrudRepository } from '../interfaces/crud.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CrudDocument.name, schema: CrudSchema },
    ]),
  ],
  providers: [
    {
      provide: CrudRepository,
      useClass: CrudMongooseRepository,
    },
  ],
  exports: [CrudRepository],
})
export class MongooseDatabaseModule {}
