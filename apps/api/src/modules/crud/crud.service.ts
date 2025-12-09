import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateCrudDto,
  CrudEntity,
  UpdateCrudDto,
} from './schemas/crud.schema';
import { NoTransaction } from '../../decorators/method/no-transaction.decorator';
import { Transactional } from '../../decorators/class/transactional.decorator';
import { MongooseModule } from '@nestjs/mongoose';
import { CrudMongoRepository } from './repositories/mongoose/crud.mongo.repository';

@Injectable()
@Transactional(MongooseModule.name)
export class CrudService {
  constructor(private readonly crudRepository: CrudMongoRepository) {}

  async createCrud(data: CreateCrudDto): Promise<CrudEntity> {
    const created = await this.crudRepository.create(data);
    console.log(created);
    throw new Error('Simulated delete error to test transaction rollback');
    return created;
  }

  @NoTransaction()
  async findAll(): Promise<CrudEntity[]> {
    return this.crudRepository.find();
  }

  @NoTransaction()
  async findOne(id: string): Promise<CrudEntity> {
    const crud = await this.crudRepository.findOneById(id);
    if (!crud) throw new NotFoundException(`Crud with id ${id} not found`);
    return crud;
  }

  async update(id: string, data: UpdateCrudDto): Promise<CrudEntity | null> {
    const updated = await this.crudRepository.update(id, data);
    if (!updated) throw new NotFoundException(`Crud with id ${id} not found`);
    return updated;
  }

  async delete(id: string): Promise<CrudEntity | null> {
    const deleted = await this.crudRepository.deleteById(id);
    if (!deleted) throw new NotFoundException(`Crud with id ${id} not found`);
    console.log(deleted);
    throw new Error('Simulated delete error to test transaction rollback');
    return deleted;
  }
}
