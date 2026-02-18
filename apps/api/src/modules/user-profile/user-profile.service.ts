import { Injectable } from '@nestjs/common';
import type { UserProfile } from '@repo/prisma-db';
import { UserProfilePrismaRepository } from './repositories/prisma/user-profile.prisma-repository';
import { AutoTransaction } from '../../decorators/class/auto-transaction.decorator';
import { ServerConstants } from '../../constants/server.constants';
import { Propagation } from '@nestjs-cls/transactional';

@Injectable()
@AutoTransaction(
  ServerConstants.TransactionConnectionNames.Prisma,
  Propagation.Required,
)
export class UserProfileService {
  constructor(
    private readonly profileRepository: UserProfilePrismaRepository,
  ) {}

  async ensureProfile(userId: string): Promise<UserProfile> {
    const existing = await this.profileRepository.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    return this.profileRepository.create({
      data: { user: { connect: { id: userId } } },
    });
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.profileRepository.findUnique({ where: { userId } });
  }

  /**
   * Persist the user's active tenant selection.
   * Does NOT validate membership — caller is responsible for that.
   */
  async setSelectedTenant(
    userId: string,
    tenantId: string | null,
  ): Promise<UserProfile> {
    return this.profileRepository.upsert({
      where: { userId },
      update: { selectedTenantId: tenantId },
      create: {
        user: { connect: { id: userId } },
        ...(tenantId ? { selectedTenant: { connect: { id: tenantId } } } : {}),
      },
    });
  }
}
