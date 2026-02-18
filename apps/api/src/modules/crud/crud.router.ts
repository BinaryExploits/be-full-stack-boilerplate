import { Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc';
import { CrudMongooseService } from './services/crud.mongoose.service';
import { CrudPrismaService } from './services/crud.prisma.service';
import * as CrudSchema from './schemas/crud.schema';
import {
  ZCrudCreateRequest,
  ZCrudCreateResponse,
  ZCrudDeleteRequest,
  ZCrudDeleteResponse,
  ZCrudFindAllRequest,
  ZCrudFindAllResponse,
  ZCrudFindOneRequest,
  ZCrudFindOneResponse,
  ZCrudUpdateRequest,
  ZCrudUpdateResponse,
} from './schemas/crud.schema';

import { AuthMiddleware } from '../auth/auth.middleware';
import { TenantResolutionMiddleware } from '../tenant/tenant-resolution.middleware';

@Router({ alias: 'crud' })
@UseMiddlewares(AuthMiddleware, TenantResolutionMiddleware)
export class CrudRouter {
  constructor(
    private readonly crudMongooseService: CrudMongooseService,
    private readonly crudPrismaService: CrudPrismaService,
  ) {}

  // ==================== MONGOOSE ENDPOINTS ====================

  @Mutation({
    input: ZCrudCreateRequest,
    output: ZCrudCreateResponse,
  })
  async createCrudMongo(
    @Input() req: CrudSchema.TCrudCreateRequest,
  ): Promise<CrudSchema.TCrudCreateResponse> {
    const created = await this.crudMongooseService.createCrud(req);
    return {
      success: created != null,
      id: created?.id,
      message: created
        ? '[Mongoose] Item created successfully'
        : 'Failed to create item',
    };
  }

  @Query({
    input: ZCrudFindAllRequest,
    output: ZCrudFindAllResponse,
  })
  async findAllMongo(
    @Input() req?: CrudSchema.TCrudFindAllRequest,
  ): Promise<CrudSchema.TCrudFindAllResponse> {
    const limit = req?.limit ?? 10;
    const offset = req?.offset ?? 0;
    const data = await this.crudMongooseService.findAll();

    return {
      success: data != null,
      cruds: data,
      total: data.length,
      limit,
      offset,
    };
  }

  @Query({
    input: ZCrudFindOneRequest,
    output: ZCrudFindOneResponse,
  })
  async findOneCrudMongo(
    @Input() req: CrudSchema.TCrudFindOneRequest,
  ): Promise<CrudSchema.TCrudFindOneResponse> {
    const result = await this.crudMongooseService.findOne(req.id);
    return result ?? null;
  }

  @Mutation({
    input: ZCrudUpdateRequest,
    output: ZCrudUpdateResponse,
  })
  async updateCrudMongo(
    @Input() req: CrudSchema.TCrudUpdateRequest,
  ): Promise<CrudSchema.TCrudUpdateResponse> {
    const updated = await this.crudMongooseService.update(req.id, req.data);
    return {
      success: updated != null,
      data: updated ?? undefined,
      message: updated
        ? '[Mongoose] Item updated successfully'
        : 'Failed to update item',
    };
  }

  @Mutation({
    input: ZCrudDeleteRequest,
    output: ZCrudDeleteResponse,
  })
  async deleteCrudMongo(
    @Input() req: CrudSchema.TCrudDeleteRequest,
  ): Promise<CrudSchema.TCrudDeleteResponse> {
    const deleted = await this.crudMongooseService.delete(req.id);
    return {
      success: deleted != null,
      message: deleted
        ? '[Mongoose] Item deleted successfully'
        : 'Failed to delete item',
    };
  }

  // ==================== PRISMA ENDPOINTS ====================

  @Mutation({
    input: ZCrudCreateRequest,
    output: ZCrudCreateResponse,
  })
  async createCrudPrisma(
    @Input() req: CrudSchema.TCrudCreateRequest,
  ): Promise<CrudSchema.TCrudCreateResponse> {
    const created = await this.crudPrismaService.createCrud(req);
    return {
      success: created != null,
      id: created?.id,
      message: created
        ? '[Prisma] Item created successfully'
        : 'Failed to create item',
    };
  }

  @Query({
    input: ZCrudFindAllRequest,
    output: ZCrudFindAllResponse,
  })
  async findAllPrisma(
    @Input() req?: CrudSchema.TCrudFindAllRequest,
  ): Promise<CrudSchema.TCrudFindAllResponse> {
    const limit = req?.limit ?? 10;
    const offset = req?.offset ?? 0;
    const data = await this.crudPrismaService.findAll();

    return {
      success: data != null,
      cruds: data,
      total: data.length,
      limit,
      offset,
    };
  }

  @Query({
    input: ZCrudFindOneRequest,
    output: ZCrudFindOneResponse,
  })
  async findOneCrudPrisma(
    @Input() req: CrudSchema.TCrudFindOneRequest,
  ): Promise<CrudSchema.TCrudFindOneResponse> {
    const result = await this.crudPrismaService.findOne(req.id);
    return result ?? null;
  }

  @Mutation({
    input: ZCrudUpdateRequest,
    output: ZCrudUpdateResponse,
  })
  async updateCrudPrisma(
    @Input() req: CrudSchema.TCrudUpdateRequest,
  ): Promise<CrudSchema.TCrudUpdateResponse> {
    const updated = await this.crudPrismaService.update(req.id, req.data);
    return {
      success: updated != null,
      data: updated ?? undefined,
      message: updated
        ? '[Prisma] Item updated successfully'
        : 'Failed to update item',
    };
  }

  @Mutation({
    input: ZCrudDeleteRequest,
    output: ZCrudDeleteResponse,
  })
  async deleteCrudPrisma(
    @Input() req: CrudSchema.TCrudDeleteRequest,
  ): Promise<CrudSchema.TCrudDeleteResponse> {
    const deleted = await this.crudPrismaService.delete(req.id);
    return {
      success: deleted != null,
      message: deleted
        ? '[Prisma] Item deleted successfully'
        : 'Failed to delete item',
    };
  }
}
