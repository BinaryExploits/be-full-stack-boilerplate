import { Injectable } from '@nestjs/common';
import { MiddlewareOptions, TRPCMiddleware } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { AppContextType } from '../../app.context';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
  constructor(private readonly authService: AuthService) {}

  // noinspection JSUnusedGlobalSymbols
  async use(opts: MiddlewareOptions): Promise<unknown> {
    const { ctx, next } = opts;
    const appCtx = ctx as AppContextType;

    const session = await this.authService.getSessionForContext(appCtx);

    if (!session) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }

    appCtx.session = session.session;
    appCtx.user = session.user;

    return next({
      ctx: {
        ...appCtx,
      },
    });
  }
}
