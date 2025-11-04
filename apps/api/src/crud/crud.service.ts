import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Crud } from '@repo/prisma-db';
import { Logger } from '@repo/utils-core';

@Injectable()
export class CrudService {
  constructor(private readonly prisma: PrismaService) {}

  async createCrud(content: string): Promise<Crud> {
    Logger.info(`Creating crud: ${content}`);
    return this.prisma.crud.create({
      data: { content },
    });
  }

  async findAll(): Promise<Crud[]> {
    Logger.info('Finding all cruds');
    return this.prisma.crud.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Crud | null> {
    Logger.info('Finding crud by id', { id });
    return this.prisma.crud.findUnique({
      where: { id },
    });
  }

  async update(id: number, updatedContent: string): Promise<Crud> {
    Logger.info('Updating crud', { id, updatedContent });
    return this.prisma.crud.update({
      where: { id },
      data: { content: updatedContent },
    });
  }

  async delete(id: number): Promise<Crud> {
    Logger.info('Deleting crud', { id });
    return this.prisma.crud.delete({
      where: { id },
    });
  }
}
