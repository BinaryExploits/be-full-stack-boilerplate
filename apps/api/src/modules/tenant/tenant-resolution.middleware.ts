import { Injectable } from '@nestjs/common';
import { MiddlewareOptions, TRPCMiddleware } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { AppContextType } from '../../app.context';
import { TenantResolutionService } from './tenant-resolution.service';

/**
 * tRPC middleware that resolves the tenant from the authenticated user's
 * selectedTenantId in the database and sets it in CLS.
 *
 * Must run AFTER AuthMiddleware (ctx.user must be set).
 * Only applied to routers that need a resolved tenant (CrudRouter, etc.).
 * Routes like myTenants/switchTenant skip this so users without a tenant are not locked out.
 */
@Injectable()
export class TenantResolutionMiddleware implements TRPCMiddleware {
  constructor(private readonly tenantResolution: TenantResolutionService) {}

  async use(opts: MiddlewareOptions): Promise<unknown> {
    const ctx = opts.ctx as AppContextType;

    if (!ctx.user?.id || !ctx.user?.email) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required for tenant resolution.',
      });
    }

    await this.tenantResolution.resolveForUser(ctx.user.id, ctx.user.email);

    return opts.next({ ctx });
  }
}
