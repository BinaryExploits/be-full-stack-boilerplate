import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

export type PrismaTransactionAdapter =
  TransactionalAdapterPrisma<PrismaService>;
