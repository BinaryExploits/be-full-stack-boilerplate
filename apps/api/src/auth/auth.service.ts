import { Injectable } from '@nestjs/common';
import type { Auth } from 'better-auth';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { BetterAuthLogger } from '../utils/logger/logger-better-auth';
import { createBetterAuth } from './auth';

@Injectable()
export class AuthService {
  public readonly auth: Auth;

  constructor(
    prisma: PrismaService,
    email: EmailService,
    logger: BetterAuthLogger,
  ) {
    this.auth = createBetterAuth(prisma, email, logger);
  }

  async getSession(headers: Headers | HeadersInit) {
    return this.auth.api.getSession({ headers });
  }
}
