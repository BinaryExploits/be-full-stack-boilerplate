import { Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc';
import { AuthMiddleware } from '../auth/auth.middleware';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { TenantService } from './tenant.service';
import {
  ZTenantCreateRequest,
  ZTenantCreateResponse,
  ZTenantDeleteRequest,
  ZTenantDeleteResponse,
  ZTenantFindAllResponse,
  ZTenantFindOneRequest,
  ZTenantFindOneResponse,
  ZTenantUpdateRequest,
  ZTenantUpdateResponse,
} from './tenant.schema';

@Router({ alias: 'tenant' })
@UseMiddlewares(AuthMiddleware, SuperAdminGuard)
export class TenantRouter {
  constructor(private readonly tenantService: TenantService) {}

  @Mutation({
    input: ZTenantCreateRequest,
    output: ZTenantCreateResponse,
  })
  async create(
    @Input()
    req: {
      name: string;
      slug: string;
      allowedOrigins: string[];
      isDefault?: boolean;
    },
  ) {
    return this.tenantService.create(req);
  }

  @Query({
    output: ZTenantFindAllResponse,
  })
  async findAll() {
    const tenants = await this.tenantService.findAll();
    return { tenants };
  }

  @Query({
    input: ZTenantFindOneRequest,
    output: ZTenantFindOneResponse,
  })
  async findOne(@Input() req: { id: string }) {
    return this.tenantService.findOne(req.id);
  }

  @Mutation({
    input: ZTenantUpdateRequest,
    output: ZTenantUpdateResponse,
  })
  async update(
    @Input()
    req: {
      id: string;
      name?: string;
      slug?: string;
      allowedOrigins?: string[];
      isDefault?: boolean;
    },
  ) {
    const { id, ...data } = req;
    return this.tenantService.update(id, data);
  }

  @Mutation({
    input: ZTenantDeleteRequest,
    output: ZTenantDeleteResponse,
  })
  async delete(@Input() req: { id: string }) {
    await this.tenantService.delete(req.id);
    return { success: true };
  }
}
