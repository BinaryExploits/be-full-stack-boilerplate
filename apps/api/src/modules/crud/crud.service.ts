import { Injectable, NotFoundException } from '@nestjs/common';
import { Crud } from './schemas/crud.schema';
import { NoTransaction } from '../../decorators/method/no-transaction.decorator';
import { Transactional } from '../../decorators/class/transactional.decorator';
import { MongooseModule } from '@nestjs/mongoose';
import { CrudMongoRepository } from './repositories/mongoose/crud.mongo.repository';

@Injectable()
@Transactional(MongooseModule.name)
export class CrudService {
  constructor(private readonly crudRepository: CrudMongoRepository) {}

  async createCrud(data: Partial<Crud>): Promise<Crud> {
    const created = await this.crudRepository.create(data);
    console.log(created);
    // throw new Error('Simulated delete error to test transaction rollback');
    return created;
  }

  @NoTransaction()
  async findAll(): Promise<Crud[]> {
    return this.crudRepository.find();
  }

  @NoTransaction()
  async findOne(id: string): Promise<Crud> {
    const crud = await this.crudRepository.findById(id);
    if (!crud) throw new NotFoundException(`Crud with id ${id} not found`);
    return crud;
  }

  async update(id: string, data: Partial<Crud>): Promise<Crud | null> {
    const updated = await this.crudRepository.findByIdAndUpdate(id, data);
    if (!updated) throw new NotFoundException(`Crud with id ${id} not found`);
    return updated;
  }

  async delete(id: string): Promise<Crud | null> {
    const deleted = await this.crudRepository.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException(`Crud with id ${id} not found`);
    console.log(deleted);
    // throw new Error('Simulated delete error to test transaction rollback');
    return deleted;
  }
}
