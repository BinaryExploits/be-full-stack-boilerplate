import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { MiddlewareOptions, TRPCMiddleware } from 'nestjs-trpc';
import { AppContextType } from '../../../app.context';

const SUPER_ADMIN_EMAILS_KEY = 'SUPER_ADMIN_EMAILS';

function getSuperAdminEmails(): Set<string> {
  const raw = process.env[SUPER_ADMIN_EMAILS_KEY];
  if (!raw?.trim()) return new Set();
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** Check if an email is in SUPER_ADMIN_EMAILS (for use in routers that only need AuthMiddleware). */
export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  return getSuperAdminEmails().has(email.trim().toLowerCase());
}

/**
 * Protects routes so only super admins (emails in env SUPER_ADMIN_EMAILS) can access.
 * Requires AuthMiddleware to run first so ctx.user is set.
 */
@Injectable()
export class SuperAdminGuard implements TRPCMiddleware {
  private readonly superAdminEmails = getSuperAdminEmails();

  use(opts: MiddlewareOptions): Promise<unknown> {
    const ctx = opts.ctx as AppContextType;
    const user = ctx.user;
    if (!user?.email) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }

    const email = user.email.trim().toLowerCase();
    if (!this.superAdminEmails.has(email)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Super admin access required',
      });
    }

    return opts.next({ ctx });
  }
}
