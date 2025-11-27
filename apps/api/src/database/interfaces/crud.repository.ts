import { BaseRepository } from './base.repository';
import {
  CreateCrudDto,
  CrudEntity,
  UpdateCrudDto,
} from '@/schemas/crud.schema';

export abstract class CrudRepository
  implements BaseRepository<CrudEntity, CreateCrudDto, UpdateCrudDto>
{
  abstract find(): Promise<CrudEntity[]>;
  abstract findOne(id: string): Promise<CrudEntity | null>;
  abstract create(data: CreateCrudDto): Promise<CrudEntity>;
  abstract update(id: string, data: UpdateCrudDto): Promise<CrudEntity | null>;
  abstract delete(id: string): Promise<CrudEntity | null>;
}
