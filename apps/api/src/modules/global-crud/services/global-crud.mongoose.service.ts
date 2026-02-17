import { Injectable } from '@nestjs/common';
import { GlobalCrud } from '../schemas/global-crud.schema';
import { NoTransaction } from '../../../decorators/method/no-transaction.decorator';
import { AutoTransaction } from '../../../decorators/class/auto-transaction.decorator';
import { ServerConstants } from '../../../constants/server.constants';
import { Propagation } from '@nestjs-cls/transactional';
import { GlobalCrudMongooseRepository } from '../repositories/mongoose/global-crud.mongoose-repository';
import { ErrorBuilder } from '../../../lib/errors';

@Injectable()
@AutoTransaction(
  ServerConstants.TransactionConnectionNames.Mongoose,
  Propagation.Required,
)
export class GlobalCrudMongooseService {
  constructor(private readonly repository: GlobalCrudMongooseRepository) {}

  async create(data: Partial<GlobalCrud>): Promise<GlobalCrud> {
    if (!data.content?.trim()) {
      return ErrorBuilder.validationError('Content cannot be empty');
    }
    return this.repository.create({ content: data.content });
  }

  @NoTransaction('Read-only')
  async findAll(): Promise<GlobalCrud[]> {
    return this.repository.find();
  }

  @NoTransaction('Read-only')
  async findOne(id: string): Promise<GlobalCrud | null> {
    return this.repository.findById(id);
  }

  async update(id: string, data: Partial<GlobalCrud>): Promise<GlobalCrud | null> {
    const updated = await this.repository.findByIdAndUpdate(id, {
      content: data.content,
    });
    if (!updated) return ErrorBuilder.resourceNotFound('GlobalCrud', id);
    return updated;
  }

  async delete(id: string): Promise<GlobalCrud | null> {
    const deleted = await this.repository.findByIdAndDelete(id);
    if (!deleted) return ErrorBuilder.resourceNotFound('GlobalCrud', id);
    return deleted;
  }
}
