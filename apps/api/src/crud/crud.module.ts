import { Module } from '@nestjs/common';
import { CrudService } from './crud.service';
import { CrudRouter } from './crud.router';

@Module({
  providers: [CrudService, CrudRouter],
  exports: [CrudService],
})
export class CrudModule {}
