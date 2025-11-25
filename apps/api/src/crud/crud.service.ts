import { Injectable, NotFoundException } from '@nestjs/common';
import { CrudRepository } from '../database/interfaces/crud.repository';
import {
  CrudEntity,
  CreateCrudDto,
  UpdateCrudDto,
} from '../schemas/crud.schema';

@Injectable()
export class CrudService {
  constructor(private readonly crudRepository: CrudRepository) {}

  async createCrud(data: CreateCrudDto): Promise<CrudEntity> {
    return this.crudRepository.create(data);
  }

  async findAll(): Promise<CrudEntity[]> {
    return this.crudRepository.find();
  }

  async findOne(id: string): Promise<CrudEntity> {
    const crud = await this.crudRepository.findOne(id);
    if (!crud) throw new NotFoundException(`Crud with id ${id} not found`);
    return crud;
  }

  async update(id: string, data: UpdateCrudDto): Promise<CrudEntity> {
    const updated = await this.crudRepository.update(id, data);
    if (!updated) throw new NotFoundException(`Crud with id ${id} not found`);
    return updated;
  }

  async delete(id: string): Promise<CrudEntity> {
    const deleted = await this.crudRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Crud with id ${id} not found`);
    return deleted;
  }
}
