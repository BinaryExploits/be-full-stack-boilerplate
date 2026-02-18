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
import { TenantAdminGuard } from './guards/tenant-admin.guard';
import { TenantService } from './tenant.service';
import { TenantMembershipService } from './tenant-membership.service';
import { UserProfileService } from '../user-profile/user-profile.service';
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
  ZMyTenantsResponse,
  ZSwitchTenantRequest,
  ZSwitchTenantResponse,
  ZAddMemberRequest,
  ZAddMemberResponse,
  ZRemoveMemberRequest,
  ZRemoveMemberResponse,
  ZListMembersRequest,
  ZListMembersResponse,
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
  TMyTenantsResponse,
  TSwitchTenantRequest,
  TSwitchTenantResponse,
  TAddMemberRequest,
  TAddMemberResponse,
  TRemoveMemberRequest,
  TRemoveMemberResponse,
  TListMembersRequest,
  TListMembersResponse,
} from './tenant.schema';
import { TRPCError } from '@trpc/server';
import type { TenantRole } from '@repo/prisma-db';

/**
 * TenantRouter uses AuthMiddleware at the router level.
 * Individual procedures add SuperAdminGuard or TenantAdminGuard as needed.
 * Note: NO TenantResolutionMiddleware here — these routes must be accessible
 * to users who have not yet selected a tenant (e.g. myTenants, switchTenant).
 */
@Router({ alias: 'tenant' })
@UseMiddlewares(AuthMiddleware)
export class TenantRouter {
  constructor(
    private readonly tenantService: TenantService,
    private readonly membershipService: TenantMembershipService,
    private readonly userProfileService: UserProfileService,
  ) {}

  // ─── Auth-only tier (no tenant required) ────────────────────

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

  /**
   * Returns the tenants the current user has membership in (by email), plus their
   * selectedTenantId. Super Admins get ALL tenants with implicit TENANT_ADMIN role.
   * This is the FIRST call after login — it MUST work without a resolved tenant.
   */
  @Query({
    output: ZMyTenantsResponse,
  })
  async myTenants(@Ctx() ctx: AppContextType): Promise<TMyTenantsResponse> {
    const email = ctx.user!.email;
    const userId = ctx.user!.id;
    const profile = await this.userProfileService.ensureProfile(userId);

    if (isSuperAdminEmail(email)) {
      const allTenants = await this.tenantService.findAll();
      return {
        success: true,
        tenants: allTenants.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          role: 'TENANT_ADMIN' as const,
        })),
        selectedTenantId: profile.selectedTenantId,
      };
    }

    const memberships = await this.membershipService.getTenantsForEmail(email);
    return {
      success: true,
      tenants: memberships.map((m) => ({
        id: m.tenant.id,
        name: m.tenant.name,
        slug: m.tenant.slug,
        role: m.role as 'TENANT_ADMIN' | 'TENANT_USER',
      })),
      selectedTenantId: profile.selectedTenantId,
    };
  }

  /**
   * Switch the user's active tenant. Validates membership (or Super Admin) first,
   * then persists selectedTenantId in UserProfile.
   */
  @Mutation({
    input: ZSwitchTenantRequest,
    output: ZSwitchTenantResponse,
  })
  async switchTenant(
    @Ctx() ctx: AppContextType,
    @Input() req: TSwitchTenantRequest,
  ): Promise<TSwitchTenantResponse> {
    const email = ctx.user!.email;
    const userId = ctx.user!.id;

    const tenant = await this.tenantService.findOne(req.tenantId);
    if (!tenant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tenant not found',
      });
    }

    if (!isSuperAdminEmail(email)) {
      const hasMembership = await this.membershipService.hasMembership(
        email,
        req.tenantId,
      );
      if (!hasMembership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this tenant',
        });
      }
    }

    await this.userProfileService.setSelectedTenant(userId, req.tenantId);

    return {
      success: true,
      selectedTenantId: req.tenantId,
    };
  }

  // ─── Super Admin tier ───────────────────────────────────────

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

  // ─── Tenant Admin tier (member management) ──────────────────

  @UseMiddlewares(TenantAdminGuard)
  @Mutation({
    input: ZAddMemberRequest,
    output: ZAddMemberResponse,
  })
  async addMember(
    @Input() req: TAddMemberRequest,
  ): Promise<TAddMemberResponse> {
    const membership = await this.membershipService.addMember(
      req.email,
      req.tenantId,
      req.role as TenantRole,
    );
    return {
      success: true,
      id: membership.id,
      email: membership.email,
      tenantId: membership.tenantId,
      role: membership.role as 'TENANT_ADMIN' | 'TENANT_USER',
    };
  }

  @UseMiddlewares(TenantAdminGuard)
  @Mutation({
    input: ZRemoveMemberRequest,
    output: ZRemoveMemberResponse,
  })
  async removeMember(
    @Input() req: TRemoveMemberRequest,
  ): Promise<TRemoveMemberResponse> {
    await this.membershipService.removeMember(req.email, req.tenantId);
    return { success: true };
  }

  @UseMiddlewares(TenantAdminGuard)
  @Query({
    input: ZListMembersRequest,
    output: ZListMembersResponse,
  })
  async listMembers(
    @Input() req: TListMembersRequest,
  ): Promise<TListMembersResponse> {
    const members = await this.membershipService.listMembers(req.tenantId);
    return {
      success: true,
      members: members.map((m) => ({
        id: m.id,
        email: m.email,
        tenantId: m.tenantId,
        role: m.role as 'TENANT_ADMIN' | 'TENANT_USER',
      })),
    };
  }
}
