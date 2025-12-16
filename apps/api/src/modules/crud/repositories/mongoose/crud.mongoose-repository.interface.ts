import { IMongooseRepository } from '../../../../repositories/mongoose/mongoose.repository.interface';
import { Crud } from '../../schemas/crud.schema';
import { CrudMongooseEntity } from './crud.mongoose-entity';
import { MongooseBaseRepository } from '../../../../repositories/mongoose/mongoose.base-repository';

export type ICrudMongooseRepository = IMongooseRepository<
  Crud,
  CrudMongooseEntity
>;

export abstract class CrudMongooseBaseRepository
  extends MongooseBaseRepository<Crud, CrudMongooseEntity>
  implements ICrudMongooseRepository {}
