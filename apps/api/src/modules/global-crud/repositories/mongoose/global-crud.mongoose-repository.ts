import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterMongoose } from '@nestjs-cls/transactional-adapter-mongoose';
import { GlobalCrudMongooseEntity } from './global-crud.mongoose-entity';
import { GlobalCrud } from '../../schemas/global-crud.schema';
import { ServerConstants } from '../../../../constants/server.constants';
import { MongooseBaseRepository } from '../../../../repositories/mongoose/mongoose.base-repository';

@Injectable()
export class GlobalCrudMongooseRepository extends MongooseBaseRepository<
  GlobalCrud,
  GlobalCrudMongooseEntity
> {
  constructor(
    @InjectModel(GlobalCrudMongooseEntity.name)
    model: Model<GlobalCrudMongooseEntity>,
    @InjectTransactionHost(ServerConstants.TransactionConnectionNames.Mongoose)
    mongoTxHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(model, mongoTxHost, { tenantScoped: false });
  }

  protected toDomainEntity(entity: GlobalCrudMongooseEntity): GlobalCrud {
    return {
      id: entity._id?.toString() ?? '',
      content: entity.content,
      createdAt: entity.createdAt ?? new Date(),
      updatedAt: entity.updatedAt ?? new Date(),
    };
  }
}
