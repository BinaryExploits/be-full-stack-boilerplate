import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc';
import { AuthMiddleware } from '../auth/auth.middleware';
import { SuperAdminGuard, isSuperAdminEmail } from './guards/super-admin.guard';
import { TenantService } from './tenant.service';
import { AppContextType } from '../../app.context';
import {
  ZTenantMetaIsSuperAdminResponse,
  ZTenantCreateRequest,
  ZTenantCreateResponse,
  ZTenantFindAllResponse,
  ZTenantFindOneRequest,
  ZTenantUpdateRequest,
  ZTenantUpdateResponse,
  ZTenantFindOneResponse,
  ZTenantDeleteRequest,
  ZTenantDeleteResponse,
  TTenantMetaIsSuperAdminResponse,
  TTenantCreateRequest,
  TTenantCreateResponse,
  TTenantFindAllResponse,
  TTenantFindOneRequest,
  TTenantFindOneResponse,
  TTenantUpdateRequest,
  TTenantUpdateResponse,
  TTenantDeleteRequest,
  TTenantDeleteResponse,
} from './tenant.schema';

@Router({ alias: 'tenant' })
@UseMiddlewares(AuthMiddleware)
export class TenantRouter {
  constructor(private readonly tenantService: TenantService) {}

  @Query({
    output: ZTenantMetaIsSuperAdminResponse,
  })
  isSuperAdmin(
    @Ctx() ctx: AppContextType,
  ): Promise<TTenantMetaIsSuperAdminResponse> {
    return Promise.resolve({
      success: true,
      isSuperAdmin: isSuperAdminEmail(ctx.user?.email),
    });
  }

  @UseMiddlewares(SuperAdminGuard)
  @Mutation({
    input: ZTenantCreateRequest,
    output: ZTenantCreateResponse,
  })
  async create(
    @Input() req: TTenantCreateRequest,
  ): Promise<TTenantCreateResponse> {
    return this.tenantService.create(req);
  }

  @UseMiddlewares(SuperAdminGuard)
  @Query({
    output: ZTenantFindAllResponse,
  })
  async findAll(): Promise<TTenantFindAllResponse> {
    const tenants = await this.tenantService.findAll();
    return { success: true, tenants };
  }

  @UseMiddlewares(SuperAdminGuard)
  @Query({
    input: ZTenantFindOneRequest,
    output: ZTenantFindOneResponse,
  })
  async findOne(
    @Input() req: TTenantFindOneRequest,
  ): Promise<TTenantFindOneResponse> {
    return this.tenantService.findOne(req.id);
  }

  @UseMiddlewares(SuperAdminGuard)
  @Mutation({
    input: ZTenantUpdateRequest,
    output: ZTenantUpdateResponse,
  })
  async update(
    @Input() req: TTenantUpdateRequest,
  ): Promise<TTenantUpdateResponse> {
    const { id, ...data } = req;
    return this.tenantService.update(id, data);
  }

  @UseMiddlewares(SuperAdminGuard)
  @Mutation({
    input: ZTenantDeleteRequest,
    output: ZTenantDeleteResponse,
  })
  async delete(
    @Input() req: TTenantDeleteRequest,
  ): Promise<TTenantDeleteResponse> {
    await this.tenantService.delete(req.id);
    return { success: true };
  }
}
