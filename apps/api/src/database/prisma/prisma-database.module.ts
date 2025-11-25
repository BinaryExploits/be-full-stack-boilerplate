import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CrudPrismaRepository } from './repositories/crud.prisma.repository';
import { CrudRepository } from '../interfaces/crud.repository.interface';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: CrudRepository,
      useClass: CrudPrismaRepository,
    },
  ],
  exports: [CrudRepository],
})
export class PrismaDatabaseModule {}
