import { Injectable } from '@nestjs/common';
import { Propagation } from '@nestjs-cls/transactional';
import { AutoTransaction } from '../../decorators/class/auto-transaction.decorator';
import { ServerConstants } from '../../constants/server.constants';
import { Logger } from '@repo/utils-core';
import { AuthService } from '../auth/auth.service';
import { UserPrismaRepository } from '../auth/repositories/prisma/user.prisma-repository';
import { AccountPrismaRepository } from '../auth/repositories/prisma/account.prisma-repository';
import { SessionPrismaRepository } from '../auth/repositories/prisma/session.prisma-repository';
import { UserProfilePrismaRepository } from '../user-profile/repositories/prisma/user-profile.prisma-repository';
import { GdprAuditLogPrismaRepository } from './repositories/prisma/gdpr-audit-log.prisma-repository';
import { AppContextType } from '../../app.context';
import type {
  TGdprMyDataResponse,
  TGdprUpdateProfileResponse,
} from './gdpr.schema';

@Injectable()
@AutoTransaction(
  ServerConstants.TransactionConnectionNames.Prisma,
  Propagation.Required,
)
export class GdprService {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserPrismaRepository,
    private readonly accountRepository: AccountPrismaRepository,
    private readonly sessionRepository: SessionPrismaRepository,
    private readonly userProfileRepository: UserProfilePrismaRepository,
    private readonly auditLogRepository: GdprAuditLogPrismaRepository,
  ) {}

  private get logger() {
    return Logger.instance.withContext(GdprService.name);
  }

  async getMyData(
    userId: string,
    ipAddress: string | null,
  ): Promise<TGdprMyDataResponse> {
    const user = await this.userRepository.findUniqueOrThrow({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        consentGiven: true,
        consentAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const accounts = await this.accountRepository.findMany({
      where: { userId },
      select: {
        providerId: true,
        scope: true,
        createdAt: true,
      },
    });

    const sessions = await this.sessionRepository.findMany({
      where: { userId },
      select: {
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    const profile = await this.userProfileRepository.findUnique({
      where: { userId },
      select: {
        createdAt: true,
      },
    });

    await this.auditLogRepository.create({
      data: {
        userId,
        action: 'DATA_ACCESS',
        details: 'User requested personal data export',
        ipAddress,
      },
    });

    return {
      success: true,
      user,
      accounts,
      sessions,
      profile,
    };
  }

  async updateProfile(
    userId: string,
    data: { name?: string; image?: string | null },
    ipAddress: string | null,
  ): Promise<TGdprUpdateProfileResponse> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.image !== undefined) updateData.image = data.image;

    const user = await this.userRepository.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        updatedAt: true,
      },
    });

    const changedFields = Object.keys(updateData).join(', ');
    await this.auditLogRepository.create({
      data: {
        userId,
        action: 'DATA_RECTIFICATION',
        details: `Profile fields updated: ${changedFields}`,
        ipAddress,
      },
    });

    this.logger.info(`Profile updated for user ${userId}`);

    return { success: true, user };
  }

  async deleteAccount(ctx: AppContextType): Promise<void> {
    await this.authService.deleteUserForContext(ctx);
    this.logger.info(`Account deleted for user ${ctx.user!.id}`);
  }
}
