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
import type { TenantContext } from '../../modules/tenant/tenant.context';

export interface MongooseBaseRepositoryOptions {
  tenantContext?: TenantContext;
  /** When true, all queries and creates are scoped by tenantContext.getTenantId() */
  tenantScoped?: boolean;
}

export abstract class MongooseBaseRepository<
  TDomainEntity extends BaseEntity,
  TDbEntity extends MongooseBaseEntity,
> implements IMongooseRepository<TDomainEntity, TDbEntity> {
  protected readonly model: Model<TDbEntity>;
  protected readonly mongoTxHost: TransactionHost<TransactionalAdapterMongoose>;
  private readonly tenantContext?: TenantContext;
  private readonly tenantScoped: boolean;

  protected constructor(
    model: Model<TDbEntity>,
    mongoTxHost: TransactionHost<TransactionalAdapterMongoose>,
    options?: MongooseBaseRepositoryOptions,
  ) {
    this.model = model;
    this.mongoTxHost = mongoTxHost;
    this.tenantContext = options?.tenantContext;
    this.tenantScoped = options?.tenantScoped ?? false;
  }

  async create(entity: Partial<TDbEntity>): Promise<TDomainEntity> {
    const doc = new this.model(this.withTenantData(entity));
    await doc.save({ session: this.mongoTxHost.tx });
    return this.toDomainEntity(doc.toObject());
  }

  async createMany(
    entities: Partial<TDbEntity>[],
    options?: InsertManyOptions,
  ): Promise<TDomainEntity[]> {
    const withTenant = entities.map((e) => this.withTenantData(e));
    const docs = await this.model.insertMany(withTenant, {
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
    const merged = {
      ...this.tenantFilter(),
      ...filter,
    } as QueryFilter<TDbEntity>;

    const docs = await this.model
      .find(merged, projection, options)
      .session(this.mongoTxHost.tx)
      .lean();

    return docs.map((doc) => this.toDomainEntity(doc));
  }

  async findById(
    id: string,
    projection?: ProjectionType<TDbEntity>,
    options?: QueryOptions<TDbEntity>,
  ): Promise<TDomainEntity | null> {
    const filter = {
      ...this.tenantFilter(),
      _id: id,
    } as QueryFilter<TDbEntity>;

    const doc = await this.model
      .findOne(filter, projection, options)
      .session(this.mongoTxHost.tx)
      .lean();

    return doc ? this.toDomainEntity(doc) : null;
  }

  async findOne(
    filter?: QueryFilter<TDbEntity>,
    projection?: ProjectionType<TDbEntity>,
    options?: QueryOptions<TDbEntity>,
  ): Promise<TDomainEntity | null> {
    const merged = {
      ...this.tenantFilter(),
      ...filter,
    } as QueryFilter<TDbEntity>;

    const doc = await this.model
      .findOne(merged, projection, options)
      .session(this.mongoTxHost.tx)
      .lean();

    return doc ? this.toDomainEntity(doc) : null;
  }

  async updateOneById(
    id: string,
    update: UpdateQuery<TDbEntity>,
  ): Promise<boolean> {
    return this.updateOne(
      { _id: id, ...this.tenantFilter() } as QueryFilter<TDbEntity>,
      update,
    );
  }

  async updateOne(
    filter: QueryFilter<TDbEntity>,
    update: UpdateQuery<TDbEntity>,
  ): Promise<boolean> {
    const merged = {
      ...this.tenantFilter(),
      ...filter,
    } as QueryFilter<TDbEntity>;

    const updateResult = await this.model
      .updateOne(merged, update)
      .session(this.mongoTxHost.tx);

    return updateResult.modifiedCount > 0;
  }

  async updateMany(
    filter: QueryFilter<TDbEntity>,
    update: UpdateQuery<TDbEntity>,
  ): Promise<boolean> {
    const merged = {
      ...this.tenantFilter(),
      ...filter,
    } as QueryFilter<TDbEntity>;

    const updateResult = await this.model
      .updateMany(merged, update)
      .session(this.mongoTxHost.tx);

    return updateResult.modifiedCount > 0;
  }

  async findByIdAndUpdate(
    id: string,
    update: UpdateQuery<TDbEntity>,
    options?: QueryOptions<TDbEntity>,
  ): Promise<TDomainEntity | null> {
    const filter = {
      _id: id,
      ...this.tenantFilter(),
    } as QueryFilter<TDbEntity>;

    const doc = await this.model
      .findOneAndUpdate(filter, update, { new: true, ...options })
      .session(this.mongoTxHost.tx)
      .lean();

    return doc ? this.toDomainEntity(doc) : null;
  }

  async findOneAndUpdate(
    filter: QueryFilter<TDbEntity>,
    update: UpdateQuery<TDbEntity>,
    options?: QueryOptions<TDbEntity>,
  ): Promise<TDomainEntity | null> {
    const merged = {
      ...this.tenantFilter(),
      ...filter,
    } as QueryFilter<TDbEntity>;

    const doc = await this.model
      .findOneAndUpdate(merged, update, { new: true, ...options })
      .session(this.mongoTxHost.tx)
      .lean();

    return doc ? this.toDomainEntity(doc) : null;
  }

  async deleteOneById(id: string): Promise<boolean> {
    return this.deleteOne({
      _id: id,
      ...this.tenantFilter(),
    } as QueryFilter<TDbEntity>);
  }

  async deleteOne(filter: QueryFilter<TDbEntity>): Promise<boolean> {
    const merged = {
      ...this.tenantFilter(),
      ...filter,
    } as QueryFilter<TDbEntity>;

    const deleteResult = await this.model
      .deleteOne(merged)
      .session(this.mongoTxHost.tx);

    return deleteResult.deletedCount > 0;
  }

  async deleteMany(filter: QueryFilter<TDbEntity>): Promise<boolean> {
    const merged = {
      ...this.tenantFilter(),
      ...filter,
    } as QueryFilter<TDbEntity>;

    const deleteResult = await this.model
      .deleteMany(merged)
      .session(this.mongoTxHost.tx);

    return deleteResult.deletedCount > 0;
  }

  async findByIdAndDelete(id: string): Promise<TDomainEntity | null> {
    const filter = {
      _id: id,
      ...this.tenantFilter(),
    } as QueryFilter<TDbEntity>;

    const deletedDoc = await this.model
      .findOneAndDelete(filter)
      .session(this.mongoTxHost.tx)
      .lean();

    return deletedDoc ? this.toDomainEntity(deletedDoc) : null;
  }

  async findOneAndDelete(
    filter: QueryFilter<TDbEntity>,
  ): Promise<TDomainEntity | null> {
    const merged = {
      ...this.tenantFilter(),
      ...filter,
    } as QueryFilter<TDbEntity>;

    const deletedDoc = await this.model
      .findOneAndDelete(merged)
      .session(this.mongoTxHost.tx)
      .lean();

    return deletedDoc ? this.toDomainEntity(deletedDoc) : null;
  }

  protected abstract toDomainEntity(tDbEntity: TDbEntity): TDomainEntity;

  /** Merge tenant filter when tenantScoped and tenantId is set. */
  private tenantFilter(): Record<string, unknown> {
    if (!this.tenantScoped || !this.tenantContext?.getTenantId()) {
      return {};
    }

    return { tenantId: this.tenantContext.getTenantId() };
  }

  private withTenantData(data: Partial<TDbEntity>): Partial<TDbEntity> {
    const tenantId = this.tenantScoped
      ? this.tenantContext?.getTenantId()
      : null;

    if (tenantId) {
      return { ...data, tenantId } as Partial<TDbEntity>;
    }

    return data;
  }
}
