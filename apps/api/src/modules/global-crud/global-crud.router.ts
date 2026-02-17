import { Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc';
import { GlobalCrudService } from './services/global-crud.service';
import { GlobalCrudMongooseService } from './services/global-crud.mongoose.service';
import {
  ZGlobalCrudCreateRequest,
  ZGlobalCrudCreateResponse,
  ZGlobalCrudDeleteRequest,
  ZGlobalCrudDeleteResponse,
  ZGlobalCrudFindAllRequest,
  ZGlobalCrudFindAllResponse,
  ZGlobalCrudFindOneRequest,
  ZGlobalCrudFindOneResponse,
  ZGlobalCrudUpdateRequest,
  ZGlobalCrudUpdateResponse,
} from './schemas/global-crud.schema';
import type { GlobalCrud } from './schemas/global-crud.schema';
import { AuthMiddleware } from '../auth/auth.middleware';

@Router({ alias: 'globalCrud' })
export class GlobalCrudRouter {
  constructor(
    private readonly globalCrudService: GlobalCrudService,
    private readonly globalCrudMongooseService: GlobalCrudMongooseService,
  ) {}

  // ==================== MONGOOSE ENDPOINTS ====================

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: ZGlobalCrudCreateRequest,
    output: ZGlobalCrudCreateResponse,
  })
  async createMongo(
    @Input() req: { content: string },
  ): Promise<{ success: boolean; id?: string; message?: string }> {
    const created = await this.globalCrudMongooseService.create(req);
    return {
      success: created != null,
      id: created?.id,
      message: created
        ? '[Mongoose] Item created successfully'
        : 'Failed to create item',
    };
  }

  @Query({
    input: ZGlobalCrudFindAllRequest,
    output: ZGlobalCrudFindAllResponse,
  })
  async findAllMongo(
    @Input() req?: { limit?: number; offset?: number },
  ): Promise<{
    success: boolean;
    items: GlobalCrud[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const limit = req?.limit ?? 10;
    const offset = req?.offset ?? 0;
    const data = await this.globalCrudMongooseService.findAll();
    return {
      success: true,
      items: data,
      total: data.length,
      limit,
      offset,
    };
  }

  @Query({
    input: ZGlobalCrudFindOneRequest,
    output: ZGlobalCrudFindOneResponse,
  })
  async findOneMongo(@Input() req: { id: string }): Promise<GlobalCrud | null> {
    return this.globalCrudMongooseService.findOne(req.id);
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: ZGlobalCrudUpdateRequest,
    output: ZGlobalCrudUpdateResponse,
  })
  async updateMongo(
    @Input() req: { id: string; data: { content: string } },
  ): Promise<{ success: boolean; data?: GlobalCrud; message?: string }> {
    const updated = await this.globalCrudMongooseService.update(
      req.id,
      req.data,
    );
    return {
      success: updated != null,
      data: updated ?? undefined,
      message: updated
        ? '[Mongoose] Item updated successfully'
        : 'Failed to update item',
    };
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: ZGlobalCrudDeleteRequest,
    output: ZGlobalCrudDeleteResponse,
  })
  async deleteMongo(
    @Input() req: { id: string },
  ): Promise<{ success: boolean; message?: string }> {
    const deleted = await this.globalCrudMongooseService.delete(req.id);
    return {
      success: deleted != null,
      message: deleted
        ? '[Mongoose] Item deleted successfully'
        : 'Failed to delete item',
    };
  }

  // ==================== PRISMA ENDPOINTS ====================

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: ZGlobalCrudCreateRequest,
    output: ZGlobalCrudCreateResponse,
  })
  async createPrisma(
    @Input() req: { content: string },
  ): Promise<{ success: boolean; id?: string; message?: string }> {
    const created = await this.globalCrudService.create(req);
    return {
      success: created != null,
      id: created?.id,
      message: created
        ? '[Prisma] Item created successfully'
        : 'Failed to create item',
    };
  }

  @Query({
    input: ZGlobalCrudFindAllRequest,
    output: ZGlobalCrudFindAllResponse,
  })
  async findAllPrisma(
    @Input() req?: { limit?: number; offset?: number },
  ): Promise<{
    success: boolean;
    items: GlobalCrud[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const limit = req?.limit ?? 10;
    const offset = req?.offset ?? 0;
    const data = await this.globalCrudService.findAll();
    return {
      success: true,
      items: data,
      total: data.length,
      limit,
      offset,
    };
  }

  @Query({
    input: ZGlobalCrudFindOneRequest,
    output: ZGlobalCrudFindOneResponse,
  })
  async findOnePrisma(
    @Input() req: { id: string },
  ): Promise<GlobalCrud | null> {
    return this.globalCrudService.findOne(req.id);
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: ZGlobalCrudUpdateRequest,
    output: ZGlobalCrudUpdateResponse,
  })
  async updatePrisma(
    @Input() req: { id: string; data: { content: string } },
  ): Promise<{ success: boolean; data?: GlobalCrud; message?: string }> {
    const updated = await this.globalCrudService.update(req.id, req.data);
    return {
      success: updated != null,
      data: updated ?? undefined,
      message: updated
        ? '[Prisma] Item updated successfully'
        : 'Failed to update item',
    };
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: ZGlobalCrudDeleteRequest,
    output: ZGlobalCrudDeleteResponse,
  })
  async deletePrisma(
    @Input() req: { id: string },
  ): Promise<{ success: boolean; message?: string }> {
    const deleted = await this.globalCrudService.delete(req.id);
    return {
      success: deleted != null,
      message: deleted
        ? '[Prisma] Item deleted successfully'
        : 'Failed to delete item',
    };
  }
}
