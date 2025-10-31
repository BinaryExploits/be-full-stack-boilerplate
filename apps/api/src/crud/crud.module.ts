import { Module } from '@nestjs/common';
import { CrudService } from './crud.service';
import { CrudRouter } from './crud.router';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CrudService, CrudRouter],
})
export class CrudModule {}
