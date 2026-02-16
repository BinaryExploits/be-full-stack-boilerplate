import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantResolutionService } from './tenant-resolution.service';

/**
 * Resolves tenant from Host/Origin and sets it in CLS so all downstream code
 * (repositories, services) see the same tenant without explicit passing.
 */
@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  constructor(private readonly tenantResolution: TenantResolutionService) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const host = req.headers['host'];
    const origin = req.headers['origin'];
    // When request is proxied (e.g. Next.js rewrite), Origin/Host may be the API server;
    // frontend sends x-tenant-origin so we can resolve tenant from the actual page origin.
    const tenantOrigin =
      (req.headers['x-tenant-origin'] as string) ||
      (typeof origin === 'string' ? origin : undefined);
    await this.tenantResolution.resolveAndSet(
      typeof host === 'string' ? host : undefined,
      tenantOrigin,
    );
    next();
  }
}
