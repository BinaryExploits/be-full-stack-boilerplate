import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { TenantContext } from './tenant.context';
import { TenantMiddleware } from './tenant.middleware';
import { TenantResolutionService } from './tenant-resolution.service';
import { TenantRouter } from './tenant.router';
import { TenantService } from './tenant.service';
import { TenantPrismaRepository } from './repositories/prisma/tenant.prisma-repository';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    TenantContext,
    TenantResolutionService,
    TenantService,
    TenantMiddleware,
    SuperAdminGuard,
    TenantRouter,
    TenantPrismaRepository,
  ],
  exports: [
    TenantContext,
    TenantService,
    TenantResolutionService,
    TenantPrismaRepository,
  ],
})
export class TenantModule {
  static readonly tenantMiddleware = TenantMiddleware;
}
