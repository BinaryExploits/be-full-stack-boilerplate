import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { BaseRepositoryMongo } from '../../../../repositories/mongoose/interfaces/base.abstract.repository';
import { CrudDocument, CrudEntity } from '../../entities/crud.entity';
import { Model } from 'mongoose';
import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterMongoose } from '@nestjs-cls/transactional-adapter-mongoose';
import { Crud } from '../../schemas/crud.schema';

export class CrudMongoRepository extends BaseRepositoryMongo<
  CrudDocument,
  Crud
> {
  constructor(
    @InjectModel(CrudEntity.name)
    crudModel: Model<CrudDocument>,
    @InjectTransactionHost(MongooseModule.name)
    mongoTxHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(crudModel, mongoTxHost);
  }

  protected toDomainEntity(dbDoc: CrudDocument): Crud {
    return {
      id: dbDoc._id.toString(),
      content: dbDoc.content.toString(),
      createdAt: dbDoc.createdAt,
      updatedAt: dbDoc.updatedAt,
    };
  }
}
