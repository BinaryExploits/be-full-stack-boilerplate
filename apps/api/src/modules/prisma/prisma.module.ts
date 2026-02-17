import { Module } from '@nestjs/common';
import { PrismaService, createPrismaServiceProxy } from './prisma.service';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TenantContextModule } from '../tenant/tenant-context.module';
import { TenantContext } from '../tenant/tenant.context';

@Module({
  imports: [TenantContextModule],
  providers: [
    {
      provide: PrismaService,
      inject: [TenantContext],
      useFactory: (tenantContext: TenantContext) =>
        createPrismaServiceProxy(new PrismaService(tenantContext)),
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}

export type PrismaTransactionAdapter =
  TransactionalAdapterPrisma<PrismaService>;
