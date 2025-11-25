import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrudRepository } from '../../interfaces/crud.repository.interface';
import {
  CrudEntity,
  CreateCrudDto,
  UpdateCrudDto,
} from '../../../schemas/crud.schema';

@Injectable()
export class CrudPrismaRepository extends CrudRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async find(): Promise<CrudEntity[]> {
    return this.prisma.crud.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<CrudEntity | null> {
    return this.prisma.crud.findUnique({
      where: { id },
    });
  }

  async create(data: CreateCrudDto): Promise<CrudEntity> {
    return this.prisma.crud.create({
      data,
    });
  }

  async update(id: string, data: UpdateCrudDto): Promise<CrudEntity | null> {
    try {
      return await this.prisma.crud.update({
        where: { id },
        data,
      });
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<CrudEntity | null> {
    try {
      return await this.prisma.crud.delete({
        where: { id },
      });
    } catch {
      return null;
    }
  }
}
