import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Crud } from '../schemas/crud.schema';
import { NoTransaction } from '../../../decorators/method/no-transaction.decorator';
import { Transactional } from '../../../decorators/class/transactional.decorator';
import { AppConstants } from '../../../constants/app.constants';
import { ICrudPrismaRepository } from '../repositories/prisma/crud.prisma-repository';

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
    console.log('[Prisma] Created:', created);
    return {
      id: created.id,
      content: created.content,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  @NoTransaction()
  async findAll(): Promise<Crud[]> {
    const results = await this.crudRepository.findMany();
    return results.map((item) => ({
      id: item.id,
      content: item.content,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  @NoTransaction()
  async findOne(id: string): Promise<Crud> {
    const crud = await this.crudRepository.findUnique({
      where: { id },
    });
    if (!crud) throw new NotFoundException(`Crud with id ${id} not found`);
    return {
      id: crud.id,
      content: crud.content,
      createdAt: crud.createdAt,
      updatedAt: crud.updatedAt,
    };
  }

  async update(id: string, data: Partial<Crud>): Promise<Crud | null> {
    const updated = await this.crudRepository.update({
      where: { id },
      data: { content: data.content },
    });
    if (!updated) throw new NotFoundException(`Crud with id ${id} not found`);
    return {
      id: updated.id,
      content: updated.content,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(id: string): Promise<Crud | null> {
    const deleted = await this.crudRepository.delete({
      where: { id },
    });
    if (!deleted) throw new NotFoundException(`Crud with id ${id} not found`);
    console.log('[Prisma] Deleted:', deleted);
    return {
      id: deleted.id,
      content: deleted.content,
      createdAt: deleted.createdAt,
      updatedAt: deleted.updatedAt,
    };
  }
}
