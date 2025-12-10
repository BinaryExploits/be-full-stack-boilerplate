import { MongooseRepositoryInterface } from './base.interface.repository';
import { Document, InsertManyOptions, Model } from 'mongoose';
import { Entity } from '../../../schemas/base.schema';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterMongoose } from '@nestjs-cls/transactional-adapter-mongoose';
import { MongooseEntity } from '../base.mongo.entity';

export abstract class BaseRepositoryMongo<
  TDomainEntity extends Entity,
  TDbEntity extends MongooseEntity,
  TDbDoc extends Document,
> implements MongooseRepositoryInterface<TDomainEntity, TDbEntity>
{
  protected readonly model: Model<TDbDoc>;
  protected readonly mongoTxHost: TransactionHost<TransactionalAdapterMongoose>;

  protected constructor(
    model: Model<TDbDoc>,
    mongoTxHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    this.model = model;
    this.mongoTxHost = mongoTxHost;
  }

  async create(entity: Partial<TDbEntity>): Promise<TDomainEntity> {
    const doc = new this.model(entity);
    await doc.save({ session: this.mongoTxHost.tx });
    return this.toDomainEntity(doc);
  }

  async createMany(
    entities: Partial<TDbEntity>[],
    options?: InsertManyOptions,
  ): Promise<TDomainEntity[]> {
    const docs = await this.model.insertMany(entities, {
      ...options,
      session: this.mongoTxHost.tx,
    });

    return docs.map((doc) => this.toDomainEntity(doc));
  }

  async find(): Promise<TDomainEntity[]> {
    const docs = await this.model.find().session(this.mongoTxHost.tx);
    return docs.map((doc) => this.toDomainEntity(doc));
  }

  async findOneById(id: string): Promise<TDomainEntity | null> {
    const doc = await this.model.findById(id).session(this.mongoTxHost.tx);
    return doc ? this.toDomainEntity(doc) : null;
  }

  async deleteById(id: string): Promise<TDomainEntity | null> {
    const deletedDoc = await this.model
      .findByIdAndDelete(id)
      .session(this.mongoTxHost.tx);
    return deletedDoc ? this.toDomainEntity(deletedDoc) : null;
  }

  async update(
    id: string,
    update: Partial<TDbEntity>,
  ): Promise<TDomainEntity | null> {
    const updatedDoc = await this.model
      .findByIdAndUpdate(id, { updateOne: update }, { new: true })
      .session(this.mongoTxHost.tx);
    return updatedDoc ? this.toDomainEntity(updatedDoc) : null;
  }

  protected abstract toDomainEntity(tDbDoc: TDbDoc): TDomainEntity;
}
