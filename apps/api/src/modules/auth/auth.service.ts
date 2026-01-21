/* eslint-disable custom/require-transactional */
import { Injectable } from '@nestjs/common';
import type { Auth } from 'better-auth';
import { EmailService } from '../email/email.service';
import { BetterAuthLogger } from '../logger/logger-better-auth';
import { createBetterAuth } from './auth';
import { AppContextType } from '../../app.context';
import { fromNodeHeaders } from 'better-auth/node';
import { DateExtensions, Logger } from '@repo/utils-core';

@Injectable()
export class AuthService {
  public readonly auth: Auth;

  constructor(email: EmailService, logger: BetterAuthLogger) {
    this.auth = createBetterAuth(email, logger);
  }

  private get logger() {
    return Logger.instance.withContext(AuthService.name);
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
    const headers = fromNodeHeaders(ctx.req.headers);
    const session = await this.getSession(headers);
    if (!session?.session.userId) {
      return undefined;
    }

    return this.getAccessToken(provider, session.session.userId, headers);
  }

  async getAccessToken(
    provider: 'google',
    userId: string,
    headers: Headers | HeadersInit,
  ): Promise<string> {
    const token = await this.hasValidAccessToken(provider, userId);
    if (token) {
      return token.accessToken;
    }

    return this.refreshAccessToken(provider, headers);
  }

  async hasValidAccessToken(provider: 'google', userId: string) {
    const token = await this.auth.api.getAccessToken({
      body: {
        providerId: provider,
        userId: userId,
      },
    });

    if (
      !token?.accessToken ||
      !token.accessTokenExpiresAt ||
      DateExtensions.hasDatePassed(token.accessTokenExpiresAt)
    ) {
      return null;
    }

    return token;
  }

  private async refreshAccessToken(
    provider: 'google',
    headers: Headers | HeadersInit,
  ): Promise<string> {
    const accounts = await this.auth.api.listUserAccounts({
      headers,
    });

    const account = accounts.find((acc) => acc.providerId === provider);
    if (!account) {
      throw new Error(
        `No ${provider} account found for provider ${provider}. User may need to link their account.`,
      );
    }

    const tokens = await this.auth.api.refreshToken({
      body: {
        providerId: provider,
        accountId: account.id,
        userId: account.userId,
      },
    });

    if (!tokens?.accessToken) {
      throw new Error(
        `Failed to refresh token for user ${account.userId} and provider ${provider}. User may need to re-authenticate.`,
      );
    }

    return tokens.accessToken;
  }
}

export type Session = typeof AuthService.prototype.auth.$Infer.Session;
export type User = Session['user'];
export type SessionData = Session['session'];
