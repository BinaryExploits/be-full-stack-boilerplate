import { Module } from '@nestjs/common';
import { CrudService } from './crud.service';
import { CrudRouter } from './crud.router';
import { MongooseModule } from '@nestjs/mongoose';
import { Crud, CrudSchema } from './crud.schema.mongo';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Crud.name, schema: CrudSchema }]),
  ],
  providers: [CrudService, CrudRouter],
})
export class CrudModule {}
