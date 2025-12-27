/* eslint-disable custom/require-transactional */
import { Injectable } from '@nestjs/common';
import type { Auth } from 'better-auth';
import { EmailService } from '../email/email.service';
import { BetterAuthLogger } from '../logger/logger-better-auth';
import { createBetterAuth } from './auth';
import { AppContextType } from '../../app.context';
import { fromNodeHeaders } from 'better-auth/node';

@Injectable()
export class AuthService {
  public readonly auth: Auth;

  constructor(email: EmailService, logger: BetterAuthLogger) {
    this.auth = createBetterAuth(email, logger);
  }

  async getSessionForContext(ctx: AppContextType): Promise<Session | null> {
    return this.getSession(fromNodeHeaders(ctx.req.headers));
  }

  async getSession(headers: Headers | HeadersInit): Promise<Session | null> {
    return this.auth.api.getSession({ headers });
  }

  async getUserForContext(ctx: AppContextType): Promise<User | null> {
    const session = await this.getSessionForContext(ctx);
    return session?.user ?? null;
  }

  async getUser(headers: Headers | HeadersInit): Promise<User | null> {
    const session = await this.getSession(headers);
    return session?.user ?? null;
  }

  async getSessionDataForContext(
    ctx: AppContextType,
  ): Promise<SessionData | null> {
    const session = await this.getSessionForContext(ctx);
    return session?.session ?? null;
  }

  async getSessionData(
    headers: Headers | HeadersInit,
  ): Promise<SessionData | null> {
    const session = await this.getSession(headers);
    return session?.session ?? null;
  }

  async getAccessTokenForContext(
    provider: 'google',
    ctx: AppContextType,
  ): Promise<string | undefined> {
    const session = await this.getSessionForContext(ctx);
    if (!session?.session.userId) {
      return undefined;
    }

    return this.getAccessToken(provider, session.session.userId);
  }

  async getAccessToken(provider: 'google', userId: string): Promise<string> {
    const token = await this.auth.api.getAccessToken({
      body: {
        providerId: provider,
        userId: userId,
      },
    });

    return token.accessToken;
  }
}

export type Session = typeof AuthService.prototype.auth.$Infer.Session;
export type User = Session['user'];
export type SessionData = Session['session'];
