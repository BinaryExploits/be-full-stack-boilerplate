import { Injectable, NotFoundException } from '@nestjs/common';
import { CrudRepository } from './repositories/crud.repository';
import {
  CreateCrudDto,
  CrudEntity,
  UpdateCrudDto,
} from './schemas/crud.schema';
// import { AutoTransaction } from '../../common/decorators/class/auto-transaction.decorator';
// import { NoTransaction } from '../../common/decorators/method/no-transaction.decorator';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class CrudService {
  constructor(private readonly crudRepository: CrudRepository) {}

  @Transactional('PRISMA_CONNECTION')
  async createCrud(data: CreateCrudDto): Promise<CrudEntity> {
    // Step 1: Create the CRUD item
    const created = await this.crudRepository.create(data);
    console.log(created);

    // Step 2: Simulate error to test rollback
    // If this line is uncommented, the create above should rollback
    throw new Error('Simulated delete error to test transaction rollback');

    return created;
  }

  async findAll(): Promise<CrudEntity[]> {
    return this.crudRepository.find();
  }

  async findOne(id: string): Promise<CrudEntity> {
    const crud = await this.crudRepository.findOne(id);
    if (!crud) throw new NotFoundException(`Crud with id ${id} not found`);
    return crud;
  }

  @Transactional('PRISMA_CONNECTION')
  async update(id: string, data: UpdateCrudDto): Promise<CrudEntity | null> {
    const updated = await this.crudRepository.update(id, data);
    if (!updated) throw new NotFoundException(`Crud with id ${id} not found`);

    console.log(updated);

    throw new Error('Simulated delete error to test transaction rollback');

    return updated;
  }

  @Transactional('PRISMA_CONNECTION')
  async delete(id: string): Promise<CrudEntity | null> {
    const deleted = await this.crudRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Crud with id ${id} not found`);

    console.log(deleted);
    throw new Error('Simulated delete error to test transaction rollback');

    return deleted;
  }
}
