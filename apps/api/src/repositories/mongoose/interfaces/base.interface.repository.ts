import { InsertManyOptions } from 'mongoose';
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

  findOneById(id: string): Promise<TDomainEntity | null>;
  find(): Promise<TDomainEntity[]>;
  deleteById(id: string): Promise<TDomainEntity | null>;
  update(id: string, update: Partial<TDbEntity>): Promise<TDomainEntity | null>;
}
