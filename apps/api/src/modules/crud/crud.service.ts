import { Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { CrudRepository } from './repositories/crud.repository';
import {
  CreateCrudDto,
  CrudEntity,
  UpdateCrudDto,
} from './schemas/crud.schema';

@Injectable()
export class CrudService {
  constructor(private readonly crudRepository: CrudRepository) {}

  async createCrud(data: CreateCrudDto): Promise<CrudEntity> {
    // Step 1: Create the CRUD item
    const created = await this.crudRepository.create(data);

    // Step 2: Simulate error to test rollback
    // If this line is uncommented, the create above should rollback
    throw new Error('Simulated error to test transaction rollback');

    return created;
  }

  // Read operations don't need transactions
  async findAll(): Promise<CrudEntity[]> {
    return this.crudRepository.find();
  }

  async findOne(id: string): Promise<CrudEntity> {
    const crud = await this.crudRepository.findOne(id);
    if (!crud) throw new NotFoundException(`Crud with id ${id} not found`);
    return crud;
  }

  @Transactional()
  async update(id: string, data: UpdateCrudDto): Promise<CrudEntity> {
    const updated = await this.crudRepository.update(id, data);
    if (!updated) throw new NotFoundException(`Crud with id ${id} not found`);
    return updated;
  }

  @Transactional()
  async delete(id: string): Promise<CrudEntity> {
    const deleted = await this.crudRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Crud with id ${id} not found`);
    return deleted;
  }
}
