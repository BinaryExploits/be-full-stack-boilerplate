import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@repo/utils-core';
import { TenantResolutionService } from './tenant-resolution.service';

/**
 * Single middleware for tenant: resolves tenant from host/origin, sets it in CLS via
 * TenantResolutionService (TenantContext), and rejects with 403 if no tenant when required.
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

    const tenantId = await this.tenantResolution.resolveAndSet(
      pageOrigin,
      requestHost,
    );

    Logger.instance.debug('[TenantMiddleware]', {
      path: req.path,
      tenantId: tenantId ?? null,
    });

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

    next();
  }
}
