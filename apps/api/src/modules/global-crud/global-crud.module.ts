import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from '../prisma/prisma.module';
import { GlobalCrudRouter } from './global-crud.router';
import { GlobalCrudService } from './services/global-crud.service';
import { GlobalCrudMongooseService } from './services/global-crud.mongoose.service';
import { GlobalCrudPrismaRepository } from './repositories/prisma/global-crud.prisma-repository';
import {
  GlobalCrudMongooseEntity,
  GlobalCrudMongooseSchema,
} from './repositories/mongoose/global-crud.mongoose-entity';
import { GlobalCrudMongooseRepository } from './repositories/mongoose/global-crud.mongoose-repository';

@Module({
  imports: [
    PrismaModule,
    MongooseModule.forFeature([
      {
        name: GlobalCrudMongooseEntity.name,
        schema: GlobalCrudMongooseSchema,
      },
    ]),
  ],
  providers: [
    GlobalCrudService,
    GlobalCrudMongooseService,
    GlobalCrudRouter,
    GlobalCrudPrismaRepository,
    GlobalCrudMongooseRepository,
  ],
  exports: [GlobalCrudService, GlobalCrudMongooseService],
})
export class GlobalCrudModule {}
