import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { AuthMiddleware } from '../auth/auth.middleware';
import { GdprService } from './gdpr.service';
import { AppContextType } from '../../app.context';
import {
  ZGdprMyDataResponse,
  ZGdprUpdateProfileRequest,
  ZGdprUpdateProfileResponse,
  ZGdprDeleteAccountRequest,
  ZGdprDeleteAccountResponse,
  TGdprMyDataResponse,
  TGdprUpdateProfileRequest,
  TGdprUpdateProfileResponse,
  TGdprDeleteAccountRequest,
  TGdprDeleteAccountResponse,
} from './gdpr.schema';

@Router({ alias: 'gdpr' })
@UseMiddlewares(AuthMiddleware)
export class GdprRouter {
  constructor(private readonly gdprService: GdprService) {}

  @Query({ output: ZGdprMyDataResponse })
  async myData(@Ctx() ctx: AppContextType): Promise<TGdprMyDataResponse> {
    const user = ctx.user!;
    return this.gdprService.getMyData(user.id, this.extractIp(ctx));
  }

  @Query({ output: ZGdprMyDataResponse })
  async exportData(@Ctx() ctx: AppContextType): Promise<TGdprMyDataResponse> {
    const user = ctx.user!;
    return this.gdprService.getMyData(user.id, this.extractIp(ctx));
  }

  @Mutation({
    input: ZGdprUpdateProfileRequest,
    output: ZGdprUpdateProfileResponse,
  })
  async updateProfile(
    @Ctx() ctx: AppContextType,
    @Input() req: TGdprUpdateProfileRequest,
  ): Promise<TGdprUpdateProfileResponse> {
    const user = ctx.user!;
    return this.gdprService.updateProfile(
      user.id,
      { name: req.name, image: req.image },
      this.extractIp(ctx),
    );
  }

  @Mutation({
    input: ZGdprDeleteAccountRequest,
    output: ZGdprDeleteAccountResponse,
  })
  async deleteAccount(
    @Ctx() ctx: AppContextType,
    @Input() req: TGdprDeleteAccountRequest,
  ): Promise<TGdprDeleteAccountResponse> {
    const user = ctx.user!;

    if (req.confirmation !== user.email) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          'Confirmation must match your email address to delete your account',
      });
    }

    await this.gdprService.deleteAccount(
      user.id,
      user.email,
      this.extractIp(ctx),
    );

    return { success: true };
  }

  private extractIp(ctx: AppContextType): string | null {
    const headers = ctx.req.headers;
    const forwarded = headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    if (Array.isArray(forwarded)) return forwarded[0];
    return (headers['x-real-ip'] as string) ?? null;
  }
}
