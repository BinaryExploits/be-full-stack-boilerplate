import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CrudPrismaRepository } from './repositories/crud.prisma.repository';
import { CRUD_REPOSITORY } from '../interfaces';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: CRUD_REPOSITORY,
      useClass: CrudPrismaRepository,
    },
  ],
  exports: [CRUD_REPOSITORY],
})
export class PrismaDatabaseModule {}
