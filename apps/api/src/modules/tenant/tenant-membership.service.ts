import { Injectable } from '@nestjs/common';
import type { TenantMembership, TenantRole } from '@repo/prisma-db';
import { TenantMembershipPrismaRepository } from './repositories/prisma/tenant-membership.prisma-repository';
import { AutoTransaction } from '../../decorators/class/auto-transaction.decorator';
import { ServerConstants } from '../../constants/server.constants';
import { Propagation } from '@nestjs-cls/transactional';

@Injectable()
@AutoTransaction(
  ServerConstants.TransactionConnectionNames.Prisma,
  Propagation.Required,
)
export class TenantMembershipService {
  constructor(
    private readonly membershipRepository: TenantMembershipPrismaRepository,
  ) {}

  async addMember(
    email: string,
    tenantId: string,
    role: TenantRole,
  ): Promise<TenantMembership> {
    const normalized = email.trim().toLowerCase();
    return this.membershipRepository.upsert({
      where: { email_tenantId: { email: normalized, tenantId } },
      update: { role },
      create: {
        email: normalized,
        tenant: { connect: { id: tenantId } },
        role,
      },
    });
  }

  async removeMember(email: string, tenantId: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    await this.membershipRepository.deleteMany({
      where: { email: normalized, tenantId },
    });
  }

  async listMembers(tenantId: string): Promise<TenantMembership[]> {
    return this.membershipRepository.findMany({
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
    const memberships = (await this.membershipRepository.findMany({
      where: { email: normalized },
      include: { tenant: { select: { id: true, name: true, slug: true } } },
    })) as Array<
      TenantMembership & { tenant: { id: string; name: string; slug: string } }
    >;
    return memberships.map((m) => ({ tenant: m.tenant, role: m.role }));
  }

  async hasMembership(email: string, tenantId: string): Promise<boolean> {
    const normalized = email.trim().toLowerCase();
    const count = await this.membershipRepository.count({
      where: { email: normalized, tenantId },
    });
    return count > 0;
  }

  async getMembership(
    email: string,
    tenantId: string,
  ): Promise<TenantMembership | null> {
    const normalized = email.trim().toLowerCase();
    return this.membershipRepository.findUnique({
      where: { email_tenantId: { email: normalized, tenantId } },
    });
  }
}
