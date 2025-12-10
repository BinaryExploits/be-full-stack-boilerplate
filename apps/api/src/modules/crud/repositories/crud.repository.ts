import { Injectable } from '@nestjs/common';
import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { CreateCrudDto, Crud, UpdateCrudDto } from '../schemas/crud.schema';
import {
  PrismaModule,
  PrismaTransactionAdapter,
} from '../../prisma/prisma.module';

@Injectable()
export class CrudRepository {
  constructor(
    @InjectTransactionHost(PrismaModule.name)
    private readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
  ) {}

  get prisma() {
    return this.prismaTxHost.tx.crud;
  }

  async find(): Promise<Crud[]> {
    return this.prisma.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Crud | null> {
    return this.prisma.findUnique({
      where: { id },
    });
  }

  async create(data: CreateCrudDto): Promise<Crud> {
    return this.prisma.create({ data });
  }

  async update(id: string, data: UpdateCrudDto): Promise<Crud | null> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Crud | null> {
    return this.prisma.delete({ where: { id } });
  }
}
