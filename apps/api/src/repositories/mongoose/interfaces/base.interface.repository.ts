import {
  InsertManyOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { MongooseEntity } from '../base.mongo.entity';
import { Entity } from '../../../schemas/base.schema';

export interface MongooseRepositoryInterface<
  TDomainEntity extends Entity,
  TDbEntity extends MongooseEntity,
> {
  create(entity: Partial<TDbEntity>): Promise<TDomainEntity>;
  createMany(
    docs: Partial<TDbEntity>[],
    options?: InsertManyOptions,
  ): Promise<TDomainEntity[]>;

  find(
    filter?: QueryFilter<TDbEntity>,
    projection?: ProjectionType<TDbEntity>,
    options?: QueryOptions<TDbEntity>,
  ): Promise<TDomainEntity[]>;
  findById(id: string): Promise<TDomainEntity | null>;
  findOne(
    filter?: QueryFilter<TDbEntity>,
    projection?: ProjectionType<TDbEntity>,
    options?: QueryOptions<TDbEntity>,
  ): Promise<TDomainEntity | null>;

  updateOneById(id: string, update: UpdateQuery<TDbEntity>): Promise<boolean>;
  updateOne(
    filter: QueryFilter<TDbEntity>,
    update: UpdateQuery<TDbEntity>,
  ): Promise<boolean>;
  updateMany(
    filter: QueryFilter<TDbEntity>,
    update: UpdateQuery<TDbEntity>,
  ): Promise<boolean>;
  findByIdAndUpdate(
    id: string,
    update: UpdateQuery<TDbEntity>,
    options?: QueryOptions<TDbEntity>,
  ): Promise<TDomainEntity | null>;
  findOneAndUpdate(
    filter: QueryFilter<TDbEntity>,
    update: UpdateQuery<TDbEntity>,
    options?: QueryOptions<TDbEntity>,
  ): Promise<TDomainEntity | null>;

  deleteOneById(id: string): Promise<boolean>;
  deleteOne(filter: QueryFilter<TDbEntity>): Promise<boolean>;
  deleteMany(filter: QueryFilter<TDbEntity>): Promise<boolean>;
  findByIdAndDelete(id: string): Promise<TDomainEntity | null>;
  findOneAndDelete(
    filter: QueryFilter<TDbEntity>,
  ): Promise<TDomainEntity | null>;
}
