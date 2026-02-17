import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@repo/utils-core';
import {
  runWithTenantStore,
  setRequestTenantId,
} from '../prisma/tenant-context-ref';
import { TenantResolutionService } from './tenant-resolution.service';

/** Paths that do not require a resolved tenant (e.g. auth, health). */
const SKIP_PATHS = ['/api/auth'];

/**
 * Single middleware for tenant: enters the request-scoped store, resolves tenant from
 * host/origin, sets both the store (for Prisma extension / @Transactional) and CLS
 * (via TenantResolutionService), and rejects if no tenant when required.
 * Keeps resolution and require-tenant in one place so the same context is used.
 * The store is kept active until the response finishes so @Transactional code sees tenantId.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantResolution: TenantResolutionService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const host = req.headers['host'];
    const origin = req.headers['origin'];
    const pageOrigin =
      (req.headers['x-tenant-origin'] as string) ||
      (typeof origin === 'string' ? origin : undefined);
    const requestHost = typeof host === 'string' ? host : undefined;

    await runWithTenantStore({ tenantId: null }, async () => {
      const tenantId = await this.tenantResolution.resolveAndSet(
        pageOrigin,
        requestHost,
      );
      setRequestTenantId(tenantId);

      if (
        !SKIP_PATHS.some((p) => req.path === p || req.path.startsWith(p + '/'))
      ) {
        if (tenantId == null) {
          Logger.instance.debug(
            '[RequireTenant] Rejecting unregistered host/origin',
            {
              path: req.path,
              host: host ?? null,
              origin:
                req.headers['x-tenant-origin'] ?? req.headers['origin'] ?? null,
            },
          );
          throw new ForbiddenException(
            'Tenant could not be resolved from request origin. Access denied.',
          );
        }
      }

      await new Promise<void>((resolve) => {
        res.once('finish', resolve);
        res.once('close', resolve);
        next();
      });
    });
  }
}
