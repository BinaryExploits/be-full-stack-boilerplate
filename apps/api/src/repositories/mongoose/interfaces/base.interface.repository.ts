import { MongoDbEntity } from '../base.mongo.entity';
import { Entity } from '../../../schemas/base.schema';

export interface MongooseRepositoryInterface<
  TDbEntity extends MongoDbEntity,
  TDomainEntity extends Entity,
> {
  create(entity: Partial<TDbEntity>): Promise<TDomainEntity>;
  findOneById(id: string): Promise<TDomainEntity | null>;
  find(): Promise<TDomainEntity[]>;
  deleteById(id: string): Promise<TDomainEntity | null>;
  update(id: string, update: Partial<TDbEntity>): Promise<TDomainEntity | null>;
}
