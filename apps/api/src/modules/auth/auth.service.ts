import { Injectable } from '@nestjs/common';
import type { Auth } from 'better-auth';
import { EmailService } from '../email/email.service';
import { BetterAuthLogger } from '../logger/logger-better-auth';
import { createBetterAuth } from './auth';

@Injectable()
export class AuthService {
  public readonly auth: Auth;

  constructor(email: EmailService, logger: BetterAuthLogger) {
    this.auth = createBetterAuth(email, logger);
  }

  ok() {}

  async getSession(headers: Headers | HeadersInit) {
    return this.auth.api.getSession({ headers });
  }
}
