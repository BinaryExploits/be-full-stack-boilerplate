import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Crud } from '@repo/prisma-db';
import { TRPCError } from '@trpc/server';

@Injectable()
export class CrudService {
  constructor(private readonly prisma: PrismaService) {}

  async createCrud(content: string): Promise<Crud> {
    // TEST: Direct TRPCError - Will be logged as 'TRPCError' with code 'FORBIDDEN'
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Forbidden trpc from create crud',
    });

    return this.prisma.crud.create({
      data: { content },
    });
  }

  async findAll(): Promise<Crud[]> {
    // TEST: Standard JavaScript Error - Will be logged as 'Error' with code 'INTERNAL_SERVER_ERROR'
    // throw new Error('Method not implemented.');

    return this.prisma.crud.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Crud | null> {
    // TEST: Null pointer exception - Will be logged as 'TypeError' with full stack trace
    const obj: any = null;
    return obj.property.value;

    return this.prisma.crud.findUnique({
      where: { id },
    });
  }

  async update(id: number, updatedContent: string): Promise<Crud> {
    // TEST: HttpException with NOT_FOUND - Will be auto-converted to tRPC 'NOT_FOUND' code
    throw new HttpException(
      'Resource not found from update crud',
      HttpStatus.NOT_FOUND,
    );

    return this.prisma.crud.update({
      where: { id },
      data: { content: updatedContent },
    });
  }

  async delete(id: number): Promise<Crud> {
    // TEST: HttpException with FORBIDDEN - Will be auto-converted to tRPC 'FORBIDDEN' code
    throw new HttpException(
      'Forbidden https from delete',
      HttpStatus.FORBIDDEN,
    );

    return this.prisma.crud.delete({
      where: { id },
    });
  }
}
