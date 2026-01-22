import { Injectable } from '@nestjs/common';
import { Crud } from '../schemas/crud.schema';
import { NoTransaction } from '../../../decorators/method/no-transaction.decorator';
import { AutoTransaction } from '../../../decorators/class/auto-transaction.decorator';
import { ServerConstants } from '../../../constants/server.constants';
import { Logger } from '@repo/utils-core';
import { Propagation } from '@nestjs-cls/transactional';
import { CrudPrismaRepository } from '../repositories/prisma/crud.prisma-repository';
import { ErrorBuilder } from '../../../lib/errors';

@Injectable()
@AutoTransaction(
  ServerConstants.TransactionConnectionNames.Prisma,
  Propagation.Required,
)
export class CrudPrismaService {
  constructor(private readonly crudRepository: CrudPrismaRepository) {}

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
    if (!updated) return ErrorBuilder.notFound(`Crud not found: ${id}`);
    return updated;
  }

  async delete(id: string): Promise<Crud | null> {
    const deleted = await this.crudRepository.delete({
      where: { id },
    });

    if (!deleted) return ErrorBuilder.notFound(`Crud not found: ${id}`);
    Logger.instance.debug('[Prisma] Deleted:', deleted);
    return deleted;
  }
}
