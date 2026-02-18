/* eslint-disable custom/require-transactional */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { TenantMembership, TenantRole } from '@repo/prisma-db';

@Injectable()
export class TenantMembershipService {
  constructor(private readonly prisma: PrismaService) {}

  async addMember(
    email: string,
    tenantId: string,
    role: TenantRole,
  ): Promise<TenantMembership> {
    const normalized = email.trim().toLowerCase();
    return this.prisma.tenantMembership.upsert({
      where: { email_tenantId: { email: normalized, tenantId } },
      update: { role },
      create: { email: normalized, tenantId, role },
    });
  }

  async removeMember(email: string, tenantId: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    await this.prisma.tenantMembership.deleteMany({
      where: { email: normalized, tenantId },
    });
  }

  async listMembers(tenantId: string): Promise<TenantMembership[]> {
    return this.prisma.tenantMembership.findMany({
      where: { tenantId },
      orderBy: { email: 'asc' },
    });
  }

  async getTenantsForEmail(email: string): Promise<
    Array<{
      tenant: { id: string; name: string; slug: string };
      role: TenantRole;
    }>
  > {
    const normalized = email.trim().toLowerCase();
    const memberships = await this.prisma.tenantMembership.findMany({
      where: { email: normalized },
      include: { tenant: { select: { id: true, name: true, slug: true } } },
    });
    return memberships.map((m) => ({ tenant: m.tenant, role: m.role }));
  }

  async hasMembership(email: string, tenantId: string): Promise<boolean> {
    const normalized = email.trim().toLowerCase();
    const count = await this.prisma.tenantMembership.count({
      where: { email: normalized, tenantId },
    });
    return count > 0;
  }

  async getMembership(
    email: string,
    tenantId: string,
  ): Promise<TenantMembership | null> {
    const normalized = email.trim().toLowerCase();
    return this.prisma.tenantMembership.findUnique({
      where: { email_tenantId: { email: normalized, tenantId } },
    });
  }
}
