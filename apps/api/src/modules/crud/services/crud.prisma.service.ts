import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Crud } from '../schemas/crud.schema';
import { NoTransaction } from '../../../decorators/method/no-transaction.decorator';
import { Transactional } from '../../../decorators/class/transactional.decorator';
import { ServerConstants } from '../../../constants/server.constants';
import { ICrudPrismaRepository } from '../repositories/prisma/crud.prisma-repository';
import { Logger } from '@repo/utils-core';
import { Propagation } from '@nestjs-cls/transactional';

@Injectable()
@Transactional(
  ServerConstants.TransactionConnectionNames.Prisma,
  Propagation.Required,
)
export class CrudPrismaService {
  constructor(
    @Inject(ServerConstants.Repositories.PrismaCrudInterface)
    private readonly crudRepository: ICrudPrismaRepository,
  ) {}

  async createCrud(data: Partial<Crud>): Promise<Crud> {
    const created = await this.crudRepository.create({
      data: {
        content: data.content!,
      },
    });

    Logger.instance.debug('[Prisma] Created:', created);
    return created;
  }

  @NoTransaction('No Reason, Testing if skipping transaction works')
  async findAll(): Promise<Crud[]> {
    return await this.crudRepository.findMany();
  }

  @NoTransaction('dont care if transaction is broken')
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
    Logger.instance.debug('[Prisma] Deleted:', deleted);
    return deleted;
  }
}
