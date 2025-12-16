import { IMongooseRepository } from './mongoose.repository.interface';
import {
  InsertManyOptions,
  Model,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { BaseEntity } from '../../schemas/base.schema';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterMongoose } from '@nestjs-cls/transactional-adapter-mongoose';
import { MongooseBaseEntity } from './mongoose.base-entity';

export abstract class MongooseBaseRepository<
  TDomainEntity extends BaseEntity,
  TDbEntity extends MongooseBaseEntity,
> implements IMongooseRepository<TDomainEntity, TDbEntity>
{
  protected readonly model: Model<TDbEntity>;
  protected readonly mongoTxHost: TransactionHost<TransactionalAdapterMongoose>;

  protected constructor(
    model: Model<TDbEntity>,
    mongoTxHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    this.model = model;
    this.mongoTxHost = mongoTxHost;
  }

  async create(entity: Partial<TDbEntity>): Promise<TDomainEntity> {
    const doc = new this.model(entity);
    await doc.save({ session: this.mongoTxHost.tx });
    return this.toDomainEntity(doc.toObject());
  }

  async createMany(
    entities: Partial<TDbEntity>[],
    options?: InsertManyOptions,
  ): Promise<TDomainEntity[]> {
    const docs = await this.model.insertMany(entities, {
      ...options,
      session: this.mongoTxHost.tx,
    });

    return docs.map((doc) => this.toDomainEntity(doc.toObject()));
  }

  async find(
    filter?: QueryFilter<TDbEntity>,
    projection?: ProjectionType<TDbEntity>,
    options?: QueryOptions<TDbEntity>,
  ): Promise<TDomainEntity[]> {
    const docs = await this.model
      .find(filter, projection, options)
      .session(this.mongoTxHost.tx)
      .lean();

    return docs.map((doc) => this.toDomainEntity(doc));
  }

  async findById(
    id: string,
    projection?: ProjectionType<TDbEntity>,
    options?: QueryOptions<TDbEntity>,
  ): Promise<TDomainEntity | null> {
    const doc = await this.model
      .findById(id, projection, options)
      .session(this.mongoTxHost.tx)
      .lean();

    return doc ? this.toDomainEntity(doc) : null;
  }

  async findOne(
    filter?: QueryFilter<TDbEntity>,
    projection?: ProjectionType<TDbEntity>,
    options?: QueryOptions<TDbEntity>,
  ): Promise<TDomainEntity | null> {
    const doc = await this.model
      .findOne(filter, projection, options)
      .session(this.mongoTxHost.tx)
      .lean();

    return doc ? this.toDomainEntity(doc) : null;
  }

  async updateOneById(
    id: string,
    update: UpdateQuery<TDbEntity>,
  ): Promise<boolean> {
    return this.updateOne({ _id: id }, update);
  }

  async updateOne(
    filter: QueryFilter<TDbEntity>,
    update: UpdateQuery<TDbEntity>,
  ): Promise<boolean> {
    const updateResult = await this.model
      .updateOne(filter, update)
      .session(this.mongoTxHost.tx);

    return updateResult.modifiedCount > 0;
  }

  async updateMany(
    filter: QueryFilter<TDbEntity>,
    update: UpdateQuery<TDbEntity>,
  ): Promise<boolean> {
    const updateResult = await this.model
      .updateMany(filter, update)
      .session(this.mongoTxHost.tx);

    return updateResult.modifiedCount > 0;
  }

  async findByIdAndUpdate(
    id: string,
    update: UpdateQuery<TDbEntity>,
    options?: QueryOptions<TDbEntity>,
  ): Promise<TDomainEntity | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, update, { new: true, ...options })
      .session(this.mongoTxHost.tx)
      .lean();

    return doc ? this.toDomainEntity(doc) : null;
  }

  async findOneAndUpdate(
    filter: QueryFilter<TDbEntity>,
    update: UpdateQuery<TDbEntity>,
    options?: QueryOptions<TDbEntity>,
  ): Promise<TDomainEntity | null> {
    const doc = await this.model
      .findOneAndUpdate(filter, update, { new: true, ...options })
      .session(this.mongoTxHost.tx)
      .lean();

    return doc ? this.toDomainEntity(doc) : null;
  }

  async deleteOneById(id: string): Promise<boolean> {
    return this.deleteOne({ _id: id });
  }

  async deleteOne(filter: QueryFilter<TDbEntity>): Promise<boolean> {
    const deleteResult = await this.model
      .deleteOne(filter)
      .session(this.mongoTxHost.tx);

    return deleteResult.deletedCount > 0;
  }

  async deleteMany(filter: QueryFilter<TDbEntity>): Promise<boolean> {
    const deleteResult = await this.model
      .deleteMany(filter)
      .session(this.mongoTxHost.tx);

    return deleteResult.deletedCount > 0;
  }

  async findByIdAndDelete(id: string): Promise<TDomainEntity | null> {
    const deletedDoc = await this.model
      .findByIdAndDelete(id)
      .session(this.mongoTxHost.tx)
      .lean();

    return deletedDoc ? this.toDomainEntity(deletedDoc) : null;
  }

  async findOneAndDelete(
    filter: QueryFilter<TDbEntity>,
  ): Promise<TDomainEntity | null> {
    const deletedDoc = await this.model
      .findOneAndDelete(filter)
      .session(this.mongoTxHost.tx)
      .lean();

    return deletedDoc ? this.toDomainEntity(deletedDoc) : null;
  }

  protected abstract toDomainEntity(tDbEntity: TDbEntity): TDomainEntity;
}
