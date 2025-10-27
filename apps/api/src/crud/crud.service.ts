import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Crud } from '../generated/prisma';

@Injectable()
export class CrudService {
  constructor(private prisma: PrismaService) {}

  async createCrud(content: string): Promise<Crud> {
    return this.prisma.crud.create({
      data: { content },
    });
  }

  async findAll(): Promise<Crud[]> {
    return this.prisma.crud.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Crud | null> {
    return this.prisma.crud.findUnique({
      where: { id },
    });
  }

  async update(id: number, updatedContent: string): Promise<Crud> {
    return this.prisma.crud.update({
      where: { id },
      data: { content: updatedContent },
    });
  }

  async delete(id: number): Promise<Crud> {
    return this.prisma.crud.delete({
      where: { id },
    });
  }
}
