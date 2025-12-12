import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Crud } from '../schemas/crud.schema';
import { NoTransaction } from '../../../decorators/method/no-transaction.decorator';
import { Transactional } from '../../../decorators/class/transactional.decorator';
import { AppConstants } from '../../../constants/app.constants';
import { ICrudMongooseRepository } from '../repositories/mongoose/crud.mongoose-repository';
import { Logger, StringExtensions } from '@repo/utils-core';

@Injectable()
@Transactional(AppConstants.DB_CONNECTIONS.MONGOOSE)
export class CrudMongooseService {
  constructor(
    @Inject(AppConstants.REPOSITORIES.CRUD_MONGOOSE)
    private readonly crudRepository: ICrudMongooseRepository,
  ) {}

  async createCrud(data: Partial<Crud>): Promise<Crud> {
    if (StringExtensions.IsNullOrEmpty(data.content)) {
      throw new BadRequestException('Content is Empty');
    }

    const created = await this.crudRepository.create({
      content: data.content,
    });

    Logger.instance.info('[Mongoose] Created:', created);

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
    const updated = await this.crudRepository.findByIdAndUpdate(id, {
      $set: { content: data.content },
    });
    if (!updated) throw new NotFoundException(`Crud with id ${id} not found`);
    return updated;
  }

  async delete(id: string): Promise<Crud | null> {
    const deleted = await this.crudRepository.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException(`Crud with id ${id} not found`);
    Logger.instance.info('[Mongoose] Deleted:', deleted);
    return deleted;
  }
}
