import { BaseRepositoryInterface } from './base.repository.interface';

export interface CrudEntity {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCrudDto {
  content: string;
}

export interface UpdateCrudDto {
  content?: string;
}

export interface CrudRepositoryInterface
  extends BaseRepositoryInterface<CrudEntity, CreateCrudDto, UpdateCrudDto> {}

export const CRUD_REPOSITORY = 'CRUD_REPOSITORY';
