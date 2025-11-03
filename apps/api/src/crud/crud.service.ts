import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Crud } from '@repo/prisma-db';
import { RollbarService } from '@andeanwide/nestjs-rollbar';
import { NestJsLogger } from '../utils/logger/NestJsLogger';

@Injectable()
export class CrudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rollbar: RollbarService,
    private readonly logger: NestJsLogger,
  ) {}

  async createCrud(content: string): Promise<Crud> {
    this.logger.log(`Creating crud: ${content}`, 'CRUD');
    return this.prisma.crud.create({
      data: { content },
    });
  }

  async findAll(): Promise<Crud[]> {
    this.rollbar.log('Finding all cruds');
    return this.prisma.crud.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Crud | null> {
    this.rollbar.log('Finding crud by id', { id });
    return this.prisma.crud.findUnique({
      where: { id },
    });
  }

  async update(id: number, updatedContent: string): Promise<Crud> {
    this.rollbar.log('Updating crud', { id, updatedContent });
    return this.prisma.crud.update({
      where: { id },
      data: { content: updatedContent },
    });
  }

  async delete(id: number): Promise<Crud> {
    this.rollbar.log('Deleting crud', { id });
    return this.prisma.crud.delete({
      where: { id },
    });
  }
}
