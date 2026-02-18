/* eslint-disable custom/require-transactional */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UserProfile } from '@repo/prisma-db';

@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureProfile(userId: string): Promise<UserProfile> {
    const existing = await this.prisma.userProfile.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    return this.prisma.userProfile.create({
      data: { userId },
    });
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.prisma.userProfile.findUnique({ where: { userId } });
  }

  /**
   * Persist the user's active tenant selection.
   * Does NOT validate membership — caller is responsible for that.
   */
  async setSelectedTenant(
    userId: string,
    tenantId: string | null,
  ): Promise<UserProfile> {
    return this.prisma.userProfile.upsert({
      where: { userId },
      update: { selectedTenantId: tenantId },
      create: { userId, selectedTenantId: tenantId },
    });
  }
}
