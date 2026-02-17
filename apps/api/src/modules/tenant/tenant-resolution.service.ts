import { Injectable } from '@nestjs/common';
import { TenantContext, TenantInfo } from './tenant.context';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@repo/utils-core';
import { AutoTransaction } from '../../decorators/class/auto-transaction.decorator';
import { ServerConstants } from '../../constants/server.constants';
import { Propagation } from '@nestjs-cls/transactional';

/**
 * Resolves tenant from request host/origin. Used by TenantResolutionMiddleware.
 * - Only exact match: host/origin must be in a tenant's allowedOrigins (no parent-domain fallback).
 * - Unregistered hosts get no tenant and are rejected by RequireTenantMiddleware.
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
   * Resolve tenant from the host the user is actually on. requestHost is usually the API
   * server (e.g. localhost:4000) due to Next.js rewrites, so we use it only when pageOrigin
   * is absent. We never mix both: one source only, exact match, or reject.
   * - pageOrigin (x-tenant-origin / Origin) → use only its normalized host, e.g. operand-solutions.localhost.
   * - No pageOrigin → use requestHost (e.g. direct API call).
   */
  async resolveAndSet(
    pageOrigin?: string,
    requestHost?: string,
  ): Promise<void> {
    const normalized =
      pageOrigin != null && pageOrigin !== ''
        ? [this.normalizeHost(pageOrigin)]
        : requestHost != null && requestHost !== ''
          ? [this.normalizeHost(requestHost)]
          : [];

    const tenant = await this.resolveTenant(normalized);
    this.tenantContext.setTenant(tenant);

    Logger.instance.debug('[TenantResolution]', {
      pageOrigin: pageOrigin ?? null,
      requestHost: requestHost ?? null,
      normalizedHosts: normalized,
      tenant: tenant ? { id: tenant.id, slug: tenant.slug } : 'none',
    });
  }

  /** Resolve tenant only when one of normalizedHosts exactly matches a tenant's allowedOrigins. */
  async resolveTenant(normalizedHosts: string[]): Promise<TenantInfo | null> {
    if (normalizedHosts.length === 0) return null;

    const allTenants = await this.prisma.tenant.findMany();
    for (const candidate of normalizedHosts) {
      const tenant = allTenants.find((t) =>
        t.allowedOrigins.some((o) => this.normalizeHost(o) === candidate),
      );
      if (tenant) return this.toTenantInfo(tenant);
    }
    return null;
  }

  private toTenantInfo(row: {
    id: string;
    name: string;
    slug: string;
    allowedOrigins: string[];
  }): TenantInfo {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      allowedOrigins: row.allowedOrigins,
    };
  }
}
