import { Module } from '@nestjs/common';
import { PrismaService, createPrismaServiceProxy } from './prisma.service';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: () => createPrismaServiceProxy(new PrismaService()),
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}

export type PrismaTransactionAdapter =
  TransactionalAdapterPrisma<PrismaService>;
