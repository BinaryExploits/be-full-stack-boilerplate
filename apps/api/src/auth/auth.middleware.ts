import { Injectable } from '@nestjs/common';
import { TRPCMiddleware, MiddlewareOptions } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { AppContextType } from '../app.context';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
  constructor(private readonly authService: AuthService) {}

  // noinspection JSUnusedGlobalSymbols
  async use(opts: MiddlewareOptions): Promise<unknown> {
    const { ctx, next } = opts;
    const appCtx = ctx as AppContextType;

    const headers = new Headers();
    const reqHeaders = appCtx.req.headers;

    for (const [key, value] of Object.entries(reqHeaders)) {
      if (value) {
        if (Array.isArray(value)) {
          for (const v of value) {
            headers.append(key, v);
          }
        } else {
          headers.set(key, String(value));
        }
      }
    }

    const session = await this.authService.getSession(headers);
    if (!session) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }

    return next({
      ctx: {
        ...appCtx,
        session: session.session,
        user: session.user,
      },
    });
  }
}
