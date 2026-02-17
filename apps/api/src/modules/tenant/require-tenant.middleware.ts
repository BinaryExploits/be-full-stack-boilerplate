import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@repo/utils-core';
import { TenantContext } from './tenant.context';

/** Paths that do not require a resolved tenant (e.g. auth, health). */
const SKIP_PATHS = ['/api/auth'];

/**
 * Rejects the request immediately if no tenant was resolved (unregistered host/origin).
 * Runs right after TenantResolutionMiddleware; no route handlers run for unregistered origins.
 */
@Injectable()
export class RequireTenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantContext: TenantContext) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    if (SKIP_PATHS.some((p) => req.path === p || req.path.startsWith(p + '/'))) {
      return next();
    }
    if (this.tenantContext.getTenantId() == null) {
      const host = req.headers['host'];
      const origin = req.headers['x-tenant-origin'] ?? req.headers['origin'];
      Logger.instance.debug('[RequireTenant] Rejecting unregistered host/origin', {
        path: req.path,
        host: host ?? null,
        origin: origin ?? null,
      });
      throw new ForbiddenException(
        'Tenant could not be resolved from request origin. Access denied.',
      );
    }
    next();
  }
}
