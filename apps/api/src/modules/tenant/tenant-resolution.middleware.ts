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

    // When request is proxied (e.g. Next.js rewrite), Host is the API server; use x-tenant-origin
    // (or Origin) first so we resolve the correct tenant from the page the user is on.
    const pageOrigin =
      (req.headers['x-tenant-origin'] as string) ||
      (typeof origin === 'string' ? origin : undefined);
    const requestHost = typeof host === 'string' ? host : undefined;
    await this.tenantResolution.resolveAndSet(pageOrigin, requestHost);

    next();
  }
}
