import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserProfileService } from './user-profile.service';
import { UserProfilePrismaRepository } from './repositories/prisma/user-profile.prisma-repository';

@Module({
  imports: [PrismaModule],
  providers: [UserProfileService, UserProfilePrismaRepository],
  exports: [UserProfileService, UserProfilePrismaRepository],
})
export class UserProfileModule {}
