import { Module, OnModuleInit } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { GdprService } from './gdpr.service';
import { GdprRouter } from './gdpr.router';
import { GdprAuditLogPrismaRepository } from './repositories/prisma/gdpr-audit-log.prisma-repository';
import { Logger } from '@repo/utils-core';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [GdprService, GdprRouter, GdprAuditLogPrismaRepository],
  exports: [GdprService],
})
export class GdprModule implements OnModuleInit {
  constructor(private readonly gdprService: GdprService) {}

  async onModuleInit() {
    try {
      await this.gdprService.cleanupExpiredVerifications();
    } catch (err) {
      Logger.instance
        .withContext('GdprModule')
        .critical('Failed to clean up expired verifications on startup', err);
    }
  }
}
