import { IMongooseRepository } from '../../../../repositories/mongoose/mongoose.repository.interface';
import { Crud } from '../../schemas/crud.schema';
import { CrudMongooseEntity } from './crud.mongoose-entity';

export interface ICrudMongooseRepository
  extends IMongooseRepository<Crud, CrudMongooseEntity> {}
