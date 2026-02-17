import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { RequireTenantMiddleware } from './require-tenant.middleware';
import { TenantContext } from './tenant.context';
import { TenantResolutionMiddleware } from './tenant-resolution.middleware';
import { TenantResolutionService } from './tenant-resolution.service';
import { TenantMetaRouter } from './tenant-meta.router';
import { TenantRouter } from './tenant.router';
import { TenantService } from './tenant.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    TenantContext,
    TenantResolutionService,
    TenantService,
    TenantResolutionMiddleware,
    RequireTenantMiddleware,
    SuperAdminGuard,
    TenantRouter,
    TenantMetaRouter,
  ],
  exports: [
    TenantContext,
    TenantService,
    TenantResolutionService,
    TenantResolutionMiddleware,
    RequireTenantMiddleware,
  ],
})
export class TenantModule {
  static readonly resolutionMiddleware = TenantResolutionMiddleware;
  static readonly requireTenantMiddleware = RequireTenantMiddleware;
}
