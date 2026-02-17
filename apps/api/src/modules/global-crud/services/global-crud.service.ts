import { Injectable } from '@nestjs/common';
import { GlobalCrud } from '../schemas/global-crud.schema';
import { NoTransaction } from '../../../decorators/method/no-transaction.decorator';
import { AutoTransaction } from '../../../decorators/class/auto-transaction.decorator';
import { ServerConstants } from '../../../constants/server.constants';
import { Propagation } from '@nestjs-cls/transactional';
import { GlobalCrudPrismaRepository } from '../repositories/prisma/global-crud.prisma-repository';
import { ErrorBuilder } from '../../../lib/errors';

@Injectable()
@AutoTransaction(
  ServerConstants.TransactionConnectionNames.Prisma,
  Propagation.Required,
)
export class GlobalCrudService {
  constructor(private readonly repository: GlobalCrudPrismaRepository) {}

  async create(data: Partial<GlobalCrud>): Promise<GlobalCrud> {
    return this.repository.create({
      data: { content: data.content! },
    });
  }

  @NoTransaction('Read-only')
  async findAll(): Promise<GlobalCrud[]> {
    return this.repository.findMany();
  }

  @NoTransaction('Read-only')
  async findOne(id: string): Promise<GlobalCrud | null> {
    return this.repository.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: Partial<GlobalCrud>,
  ): Promise<GlobalCrud | null> {
    const updated = await this.repository.update({
      where: { id },
      data: { content: data.content },
    });
    if (!updated) return ErrorBuilder.resourceNotFound('GlobalCrud', id);
    return updated;
  }

  async delete(id: string): Promise<GlobalCrud | null> {
    const deleted = await this.repository.delete({ where: { id } });
    if (!deleted) return ErrorBuilder.resourceNotFound('GlobalCrud', id);
    return deleted;
  }
}
