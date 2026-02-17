import { Module } from '@nestjs/common';
import { TenantContext } from './tenant.context';

/**
 * Provides TenantContext (CLS-based) so other modules (e.g. Prisma) can use it
 * without importing the full TenantModule (avoids circular dependency).
 */
@Module({
  providers: [TenantContext],
  exports: [TenantContext],
})
export class TenantContextModule {}
