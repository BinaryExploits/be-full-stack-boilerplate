import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Crud } from '../schemas/crud.schema';
import { NoTransaction } from '../../../decorators/method/no-transaction.decorator';
import { Transactional } from '../../../decorators/class/transactional.decorator';
import { AppConstants } from '../../../constants/app.constants';
import { ICrudPrismaRepository } from '../repositories/prisma/crud.prisma-repository';
import { Logger } from '@repo/utils-core';

@Injectable()
@Transactional(AppConstants.DB_CONNECTIONS.PRISMA)
export class CrudPrismaService {
  constructor(
    @Inject(AppConstants.REPOSITORIES.CRUD_PRISMA)
    private readonly crudRepository: ICrudPrismaRepository,
  ) {}

  async createCrud(data: Partial<Crud>): Promise<Crud> {
    const created = await this.crudRepository.create({
      data: {
        content: data.content!,
      },
    });

    Logger.instance.info('[Prisma] Created:', created);
    return created;
  }

  @NoTransaction()
  async findAll(): Promise<Crud[]> {
    return await this.crudRepository.findMany();
  }

  @NoTransaction()
  async findOne(id: string): Promise<Crud | null> {
    return this.crudRepository.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Partial<Crud>): Promise<Crud | null> {
    const updated = await this.crudRepository.update({
      where: { id },
      data: { content: data.content },
    });
    if (!updated) throw new NotFoundException(`Crud with id ${id} not found`);
    return updated;
  }

  async delete(id: string): Promise<Crud | null> {
    const deleted = await this.crudRepository.delete({
      where: { id },
    });

    if (!deleted) throw new NotFoundException(`Crud with id ${id} not found`);
    Logger.instance.info('[Prisma] Deleted:', deleted);
    return deleted;
  }
}
