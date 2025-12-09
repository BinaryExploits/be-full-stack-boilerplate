import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { BaseRepositoryMongo } from '../../../../repositories/mongoose/interfaces/base.abstract.repository';
import { CrudDocument } from '../../models/crud.model';
import { CrudEntity } from '../../schemas/crud.schema';
import { Model } from 'mongoose';
import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterMongoose } from '@nestjs-cls/transactional-adapter-mongoose';

export class CrudMongoRepository extends BaseRepositoryMongo<
  CrudDocument,
  CrudEntity
> {
  constructor(
    @InjectModel(CrudDocument.name)
    crudModel: Model<CrudDocument>,
    @InjectTransactionHost(MongooseModule.name)
    mongoTxHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(crudModel, mongoTxHost);
  }

  protected toDomainEntity(dbEntity: CrudDocument): CrudEntity {
    return {
      id: dbEntity._id.toString(),
      content: dbEntity.content.toString(),
      createdAt: dbEntity.createdAt,
      updatedAt: dbEntity.updatedAt,
    };
  }
}
