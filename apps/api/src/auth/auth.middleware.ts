import { Injectable } from '@nestjs/common';
import { TRPCMiddleware, MiddlewareOptions } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { AppContextType } from '../app.context';
import { AuthService } from './auth.service';
import { fromNodeHeaders } from 'better-auth/node';

@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
  constructor(private readonly authService: AuthService) {}

  // noinspection JSUnusedGlobalSymbols
  async use(opts: MiddlewareOptions): Promise<unknown> {
    const { ctx, next } = opts;
    const appCtx = ctx as AppContextType;

    const session = await this.authService.getSession(
      fromNodeHeaders(appCtx.req.headers),
    );

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
