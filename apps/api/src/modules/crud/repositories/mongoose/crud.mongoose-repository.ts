import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterMongoose } from '@nestjs-cls/transactional-adapter-mongoose';
import { CrudMongooseEntity } from './crud.mongoose-entity';
import { Crud } from '../../schemas/crud.schema';
import { CrudMongooseBaseRepository } from './crud.mongoose-repository.interface';
import { ServerConstants } from '../../../../constants/server.constants';

@Injectable()
export class CrudMongooseRepository extends CrudMongooseBaseRepository {
  constructor(
    @InjectModel(CrudMongooseEntity.name)
    crudModel: Model<CrudMongooseEntity>,
    @InjectTransactionHost(ServerConstants.TransactionConnectionNames.Mongoose)
    mongoTxHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(crudModel, mongoTxHost);
  }

  protected toDomainEntity(dbEntity: CrudMongooseEntity): Crud {
    return {
      id: dbEntity._id?.toString() ?? '',
      content: dbEntity.content,
      createdAt: dbEntity.createdAt,
      updatedAt: dbEntity.updatedAt,
    };
  }
}
