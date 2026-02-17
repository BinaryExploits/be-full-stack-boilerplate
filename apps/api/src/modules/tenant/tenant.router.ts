import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc';
import { AuthMiddleware } from '../auth/auth.middleware';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { TenantService } from './tenant.service';
import { isSuperAdminEmail } from './guards/super-admin.guard';
import { AppContextType } from '../../app.context';
import * as TenantSchema from './tenant.schema';

@Router({ alias: 'tenant' })
@UseMiddlewares(AuthMiddleware)
export class TenantRouter {
  constructor(private readonly tenantService: TenantService) {}

  @Query({
    output: TenantSchema.ZTenantMetaIsSuperAdminResponse,
  })
  isSuperAdmin(
    @Ctx() ctx: AppContextType,
  ): Promise<TenantSchema.TTenantMetaIsSuperAdminResponse> {
    return Promise.resolve({
      success: true,
      isSuperAdmin: isSuperAdminEmail(ctx.user?.email),
    });
  }

  @UseMiddlewares(SuperAdminGuard)
  @Mutation({
    input: TenantSchema.ZTenantCreateRequest,
    output: TenantSchema.ZTenantCreateResponse,
  })
  async create(
    @Input() req: TenantSchema.TTenantCreateRequest,
  ): Promise<TenantSchema.TTenantCreateResponse> {
    return this.tenantService.create(req);
  }

  @UseMiddlewares(SuperAdminGuard)
  @Query({
    output: TenantSchema.ZTenantFindAllResponse,
  })
  async findAll(): Promise<TenantSchema.TTenantFindAllResponse> {
    const tenants = await this.tenantService.findAll();
    return { success: true, tenants };
  }

  @UseMiddlewares(SuperAdminGuard)
  @Query({
    input: TenantSchema.ZTenantFindOneRequest,
    output: TenantSchema.ZTenantFindOneResponse,
  })
  async findOne(
    @Input() req: TenantSchema.TTenantFindOneRequest,
  ): Promise<TenantSchema.TTenantFindOneResponse> {
    return this.tenantService.findOne(req.id);
  }

  @UseMiddlewares(SuperAdminGuard)
  @Mutation({
    input: TenantSchema.ZTenantUpdateRequest,
    output: TenantSchema.ZTenantUpdateResponse,
  })
  async update(
    @Input() req: TenantSchema.TTenantUpdateRequest,
  ): Promise<TenantSchema.TTenantUpdateResponse> {
    const { id, ...data } = req;
    return this.tenantService.update(id, data);
  }

  @UseMiddlewares(SuperAdminGuard)
  @Mutation({
    input: TenantSchema.ZTenantDeleteRequest,
    output: TenantSchema.ZTenantDeleteResponse,
  })
  async delete(
    @Input() req: TenantSchema.TTenantDeleteRequest,
  ): Promise<TenantSchema.TTenantDeleteResponse> {
    await this.tenantService.delete(req.id);
    return { success: true };
  }
}
