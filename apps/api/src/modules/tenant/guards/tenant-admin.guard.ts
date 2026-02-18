import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { MiddlewareOptions, TRPCMiddleware } from 'nestjs-trpc';
import { AppContextType } from '../../../app.context';
import { TenantMembershipService } from '../tenant-membership.service';
import { isSuperAdminEmail } from './super-admin.guard';

/**
 * Allows access if the caller is a Super Admin (env-based) OR has TENANT_ADMIN role
 * for the target tenant. The target tenant is inferred from `input.tenantId`.
 * Requires AuthMiddleware to run first so ctx.user is set.
 */
@Injectable()
export class TenantAdminGuard implements TRPCMiddleware {
  constructor(private readonly membershipService: TenantMembershipService) {}

  async use(opts: MiddlewareOptions): Promise<unknown> {
    const ctx = opts.ctx as AppContextType;
    const user = ctx.user;

    if (!user?.email) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }

    if (isSuperAdminEmail(user.email)) {
      return opts.next({ ctx });
    }

    const input = opts.rawInput as { tenantId?: string } | undefined;
    const tenantId = input?.tenantId;

    if (!tenantId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'tenantId is required for this operation',
      });
    }

    const membership = await this.membershipService.getMembership(
      user.email,
      tenantId,
    );

    if (!membership || membership.role !== 'TENANT_ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Tenant admin access required for this tenant',
      });
    }

    return opts.next({ ctx });
  }
}
