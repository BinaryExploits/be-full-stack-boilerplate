import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CRUD_REPOSITORY,
  CrudRepositoryInterface,
  CrudEntity,
} from '../database/interfaces';

@Injectable()
export class CrudService {
  constructor(
    @Inject(CRUD_REPOSITORY)
    private readonly crudRepository: CrudRepositoryInterface,
  ) {}

  async createCrud(content: string): Promise<CrudEntity> {
    return this.crudRepository.create({ content });
  }

  async findAll(): Promise<CrudEntity[]> {
    return this.crudRepository.findAll();
  }

  async findOne(id: string): Promise<CrudEntity> {
    const crud = await this.crudRepository.findById(id);
    if (!crud) throw new NotFoundException(`Crud with id ${id} not found`);
    return crud;
  }

  async update(id: string, updatedContent: string): Promise<CrudEntity> {
    const updated = await this.crudRepository.update(id, {
      content: updatedContent,
    });
    if (!updated) throw new NotFoundException(`Crud with id ${id} not found`);
    return updated;
  }

  async delete(id: string): Promise<CrudEntity> {
    const deleted = await this.crudRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Crud with id ${id} not found`);
    return deleted;
  }
}
