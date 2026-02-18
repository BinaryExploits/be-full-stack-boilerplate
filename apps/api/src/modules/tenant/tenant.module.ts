import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { TenantAdminGuard } from './guards/tenant-admin.guard';
import { TenantContext } from './tenant.context';
import { TenantResolutionService } from './tenant-resolution.service';
import { TenantResolutionMiddleware } from './tenant-resolution.middleware';
import { TenantMembershipService } from './tenant-membership.service';
import { TenantRouter } from './tenant.router';
import { TenantService } from './tenant.service';
import { TenantPrismaRepository } from './repositories/prisma/tenant.prisma-repository';

@Module({
  imports: [PrismaModule, AuthModule, UserProfileModule],
  providers: [
    TenantContext,
    TenantResolutionService,
    TenantResolutionMiddleware,
    TenantMembershipService,
    TenantService,
    SuperAdminGuard,
    TenantAdminGuard,
    TenantRouter,
    TenantPrismaRepository,
  ],
  exports: [
    TenantContext,
    TenantService,
    TenantResolutionService,
    TenantResolutionMiddleware,
    TenantMembershipService,
    TenantPrismaRepository,
  ],
})
export class TenantModule {}
