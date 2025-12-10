import { Injectable } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterMongoose } from '@nestjs-cls/transactional-adapter-mongoose';
import { BaseRepositoryMongo } from '../../../../repositories/mongoose/interfaces/base.abstract.repository';
import { CrudEntity } from './entities/crud.entity';
import { Crud } from '../../schemas/crud.schema';

@Injectable()
export class CrudMongoRepository extends BaseRepositoryMongo<Crud, CrudEntity> {
  constructor(
    @InjectModel(CrudEntity.name)
    crudModel: Model<CrudEntity>,
    @InjectTransactionHost(MongooseModule.name)
    mongoTxHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(crudModel, mongoTxHost);
  }

  protected toDomainEntity(dbEntity: CrudEntity): Crud {
    return {
      id: dbEntity._id?.toString() ?? '',
      content: dbEntity.content,
      createdAt: dbEntity.createdAt,
      updatedAt: dbEntity.updatedAt,
    };
  }
}
