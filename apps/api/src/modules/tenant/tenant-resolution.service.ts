/* eslint-disable custom/require-transactional */
import { Injectable } from '@nestjs/common';
import { TenantContext } from './tenant.context';
import { TenantPrismaRepository } from './repositories/prisma/tenant.prisma-repository';
import { UserProfileService } from '../user-profile/user-profile.service';
import { TenantMembershipService } from './tenant-membership.service';
import { isSuperAdminEmail } from './guards/super-admin.guard';
import { Logger } from '@repo/utils-core';
import { TRPCError } from '@trpc/server';

/**
 * Resolves tenant from the authenticated user's persisted selectedTenantId.
 *
 * Flow (called from TenantResolutionMiddleware on tenant-scoped routes only):
 *  1. Ensure a UserProfile row exists for the user.
 *  2. If selectedTenantId is set, verify the user still has access (TenantMembership or Super Admin).
 *  3. If valid, load tenant and set it in CLS via TenantContext.
 *  4. If no selectedTenantId or invalid membership, throw PRECONDITION_FAILED so the client
 *     knows to redirect to the tenant switcher.
 *
 * Routes that do NOT need a resolved tenant (myTenants, switchTenant, isSuperAdmin)
 * skip this middleware entirely — they only use AuthMiddleware.
 */
@Injectable()
export class TenantResolutionService {
  constructor(
    private readonly tenantRepository: TenantPrismaRepository,
    private readonly tenantContext: TenantContext,
    private readonly userProfileService: UserProfileService,
    private readonly membershipService: TenantMembershipService,
  ) {}

  /**
   * Resolve the tenant for an authenticated user and inject it into the request-scoped CLS.
   * Returns the resolved tenant ID.
   */
  async resolveForUser(userId: string, userEmail: string): Promise<string> {
    const profile = await this.userProfileService.ensureProfile(userId);

    if (!profile.selectedTenantId) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'No tenant selected. Please select a tenant first.',
      });
    }

    const isSuperAdmin = isSuperAdminEmail(userEmail);

    if (!isSuperAdmin) {
      const hasMembership = await this.membershipService.hasMembership(
        userEmail,
        profile.selectedTenantId,
      );

      if (!hasMembership) {
        await this.userProfileService.setSelectedTenant(userId, null);
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message:
            'You no longer have access to this tenant. Please select another tenant.',
        });
      }
    }

    const tenant = await this.tenantRepository.findUnique({
      where: { id: profile.selectedTenantId },
    });

    if (!tenant) {
      await this.userProfileService.setSelectedTenant(userId, null);
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message:
          'The selected tenant no longer exists. Please select another tenant.',
      });
    }

    this.tenantContext.setTenant(tenant);

    Logger.instance.debug('[TenantResolution]', {
      userId,
      tenantId: tenant.id,
      slug: tenant.slug,
    });

    return tenant.id;
  }
}
