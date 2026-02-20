import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { GdprService } from './gdpr.service';
import { GdprRouter } from './gdpr.router';
import { GdprAuditLogPrismaRepository } from './repositories/prisma/gdpr-audit-log.prisma-repository';

@Module({
  imports: [PrismaModule, AuthModule, UserProfileModule],
  providers: [GdprService, GdprRouter, GdprAuditLogPrismaRepository],
  exports: [GdprService],
})
export class GdprModule {}
