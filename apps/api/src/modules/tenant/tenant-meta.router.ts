import { Ctx, Query, Router, UseMiddlewares } from 'nestjs-trpc';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AppContextType } from '../../app.context';
import { isSuperAdminEmail } from './guards/super-admin.guard';
import { z } from 'zod';

const ZIsSuperAdminResponse = z.object({ isSuperAdmin: z.boolean() });

@Router({ alias: 'tenantMeta' })
@UseMiddlewares(AuthMiddleware)
export class TenantMetaRouter {
  @Query({
    output: ZIsSuperAdminResponse,
  })
  isSuperAdmin(@Ctx() ctx: AppContextType): { isSuperAdmin: boolean } {
    return { isSuperAdmin: isSuperAdminEmail(ctx.user?.email) };
  }
}
