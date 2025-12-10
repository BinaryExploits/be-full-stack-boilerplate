import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { BaseRepositoryMongo } from '../../../../repositories/mongoose/interfaces/base.abstract.repository';
import { CrudEntity } from '../../entities/crud.entity';
import { Model } from 'mongoose';
import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterMongoose } from '@nestjs-cls/transactional-adapter-mongoose';
import { Crud } from '../../schemas/crud.schema';

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
      id: dbEntity.id,
      content: dbEntity.content,
      createdAt: dbEntity.createdAt,
      updatedAt: dbEntity.updatedAt,
    };
  }
}
