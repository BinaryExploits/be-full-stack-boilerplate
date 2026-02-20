import { Injectable } from '@nestjs/common';
import { Propagation } from '@nestjs-cls/transactional';
import { PrismaService } from '../prisma/prisma.service';
import { GdprAuditLogPrismaRepository } from './repositories/prisma/gdpr-audit-log.prisma-repository';
import { AutoTransaction } from '../../decorators/class/auto-transaction.decorator';
import { ServerConstants } from '../../constants/server.constants';
import { Logger } from '@repo/utils-core';
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
    private readonly prisma: PrismaService,
    private readonly auditLogRepository: GdprAuditLogPrismaRepository,
  ) {}

  private get logger() {
    return Logger.instance.withContext(GdprService.name);
  }

  async getMyData(
    userId: string,
    ipAddress: string | null,
  ): Promise<TGdprMyDataResponse> {
    const user = await this.prisma.user.findUniqueOrThrow({
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

    const accounts = await this.prisma.account.findMany({
      where: { userId },
      select: {
        providerId: true,
        scope: true,
        createdAt: true,
      },
    });

    const sessions = await this.prisma.session.findMany({
      where: { userId },
      select: {
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    const profile = await this.prisma.userProfile.findUnique({
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

    const user = await this.prisma.user.update({
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

  async deleteAccount(
    userId: string,
    userEmail: string,
    ipAddress: string | null,
  ): Promise<void> {
    const normalizedEmail = userEmail.trim().toLowerCase();

    await this.auditLogRepository.create({
      data: {
        userId,
        action: 'DATA_DELETION',
        details: 'Account deletion requested and executed',
        ipAddress,
      },
    });

    await this.prisma.tenantMembership.deleteMany({
      where: { email: normalizedEmail },
    });

    await this.prisma.verification.deleteMany({
      where: { identifier: normalizedEmail },
    });

    // Cascade handles: Session, Account, UserProfile
    await this.prisma.user.delete({
      where: { id: userId },
    });

    this.logger.info(`Account deleted for user ${userId}`);
  }

  async cleanupExpiredVerifications(): Promise<number> {
    const result = await this.prisma.verification.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    if (result.count > 0) {
      this.logger.info(
        `Cleaned up ${result.count} expired verification tokens`,
      );
    }

    return result.count;
  }
}
