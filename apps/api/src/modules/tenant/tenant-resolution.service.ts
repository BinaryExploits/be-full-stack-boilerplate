import { Injectable } from '@nestjs/common';
import { TenantContext, TenantInfo } from './tenant.context';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Resolves tenant from request host/origin. Used by TenantResolutionMiddleware.
 * - Match Host or Origin header against Tenant.allowedOrigins.
 * - If no match and a default tenant exists, use it (single-tenant mode).
 */
@Injectable()
export class TenantResolutionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  /**
   * Normalize host for matching: lowercase, strip port, strip protocol from origin.
   */
  normalizeHost(hostOrOrigin: string): string {
    try {
      const s = hostOrOrigin.trim().toLowerCase();
      if (s.startsWith('http://') || s.startsWith('https://')) {
        const u = new URL(s);
        return u.hostname;
      }
      return s.split(':')[0];
    } catch {
      return hostOrOrigin.trim().toLowerCase();
    }
  }

  /**
   * Resolve tenant from host and origin, then set it in TenantContext (CLS).
   */
  async resolveAndSet(host?: string, origin?: string): Promise<void> {
    const candidates = [host, origin].filter(Boolean) as string[];
    const normalized = [...new Set(candidates.map((c) => this.normalizeHost(c)))];
    const tenant = await this.resolveTenant(normalized);
    this.tenantContext.setTenant(tenant);
  }

  async resolveTenant(normalizedHosts: string[]): Promise<TenantInfo | null> {
    const allTenants = await this.prisma.tenant.findMany({
      orderBy: { isDefault: 'desc' },
    });

    for (const t of allTenants) {
      if (!t.isDefault) {
        const matches = t.allowedOrigins.some((o) =>
          normalizedHosts.includes(this.normalizeHost(o)),
        );
        if (matches) return this.toTenantInfo(t);
      }
    }
    const defaultTenant = allTenants.find((t) => t.isDefault);
    return defaultTenant ? this.toTenantInfo(defaultTenant) : null;
  }

  private toTenantInfo(row: {
    id: string;
    name: string;
    slug: string;
    allowedOrigins: string[];
    isDefault: boolean;
  }): TenantInfo {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      allowedOrigins: row.allowedOrigins,
      isDefault: row.isDefault,
    };
  }
}
