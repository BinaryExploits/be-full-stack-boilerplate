import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from '../prisma/prisma.module';
import {
  CrudMongooseEntity,
  CrudMongooseSchema,
} from './repositories/mongoose/crud.mongoose-entity';
import { CrudRouter } from './crud.router';
import { CrudMongooseRepository } from './repositories/mongoose/crud.mongoose-repository';
import { CrudPrismaRepository } from './repositories/prisma/crud.prisma-repository';
import { CrudMongooseService } from './services/crud.mongoose.service';
import { CrudPrismaService } from './services/crud.prisma.service';

@Module({
  imports: [
    PrismaModule,
    MongooseModule.forFeature([
      { name: CrudMongooseEntity.name, schema: CrudMongooseSchema },
    ]),
  ],
  providers: [
    CrudMongooseService,
    CrudPrismaService,
    CrudRouter,
    CrudMongooseRepository,
    CrudPrismaRepository,
  ],
  exports: [CrudMongooseService, CrudPrismaService],
})
export class CrudModule {}
