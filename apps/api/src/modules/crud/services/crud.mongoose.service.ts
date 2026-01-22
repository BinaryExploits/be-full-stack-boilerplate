import { Injectable } from '@nestjs/common';
import { Crud } from '../schemas/crud.schema';
import { NoTransaction } from '../../../decorators/method/no-transaction.decorator';
import { AutoTransaction } from '../../../decorators/class/auto-transaction.decorator';
import { ServerConstants } from '../../../constants/server.constants';
import { Logger, StringExtensions } from '@repo/utils-core';
import { Propagation } from '@nestjs-cls/transactional';
import { CrudMongooseRepository } from '../repositories/mongoose/crud.mongoose-repository';
import { ErrorBuilder } from '../../../lib/errors';

@Injectable()
@AutoTransaction(
  ServerConstants.TransactionConnectionNames.Mongoose,
  Propagation.Required,
)
export class CrudMongooseService {
  constructor(private readonly crudRepository: CrudMongooseRepository) {}

  async createCrud(data: Partial<Crud>): Promise<Crud> {
    if (StringExtensions.IsNullOrEmpty(data.content)) {
      return ErrorBuilder.validationError('Content cannot be empty');
    }

    const created = await this.crudRepository.create({
      content: data.content,
    });

    Logger.instance.debug('[Mongoose] Created:', created);
    return created;
  }

  @NoTransaction('No Reason, Testing if skipping transaction works')
  async findAll(): Promise<Crud[]> {
    return this.crudRepository.find();
  }

  @NoTransaction('dont care if transaction is broken')
  async findOne(id: string): Promise<Crud> {
    const crud = await this.crudRepository.findById(id);
    if (!crud) return ErrorBuilder.resourceNotFound('Crud', id);
    return crud;
  }

  async update(id: string, data: Partial<Crud>): Promise<Crud | null> {
    const updated = await this.crudRepository.findByIdAndUpdate(id, {
      content: data.content,
    });
    if (!updated) return ErrorBuilder.resourceNotFound('Crud', id);
    return updated;
  }

  async delete(id: string): Promise<Crud | null> {
    const deleted = await this.crudRepository.findByIdAndDelete(id);
    if (!deleted) return ErrorBuilder.resourceNotFound('Crud', id);
    Logger.instance.debug('[Mongoose] Deleted:', deleted);
    return deleted;
  }
}
