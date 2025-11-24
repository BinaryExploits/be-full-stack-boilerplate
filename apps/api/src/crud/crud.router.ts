import { Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc';
import { CrudService } from './crud.service';
import * as CrudSchema from './crud.schema';

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
} from './crud.schema';

import { AuthMiddleware } from '../auth/auth.middleware';

@Router({ alias: 'crud' })
export class CrudRouter {
  constructor(private readonly crudService: CrudService) {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: ZCrudCreateRequest,
    output: ZCrudCreateResponse,
  })
  async createCrud(
    @Input() req: CrudSchema.TCrudCreateRequest,
  ): Promise<CrudSchema.TCrudCreateResponse> {
    const created = await this.crudService.createCrud(req.content);
    return {
      id: created?.id ?? '',
      success: created != null,
      message: created ? 'Item created successfully' : 'Failed to create item',
    };
  }

  @Query({
    input: ZCrudFindAllRequest,
    output: ZCrudFindAllResponse,
  })
  async findAll(
    @Input() req?: CrudSchema.TCrudFindAllRequest,
  ): Promise<CrudSchema.TCrudFindAllResponse> {
    const limit = req?.limit ?? 10;
    const offset = req?.offset ?? 0;
    const data = await this.crudService.findAll();

    return {
      success: data != null,
      cruds: data.map((item) => ({
        id: item.id,
        content: item.content,
      })),
      total: data.length,
      limit,
      offset,
    };
  }

  @Query({
    input: ZCrudFindOneRequest,
    output: ZCrudFindOneResponse,
  })
  async findOneCrud(
    @Input() req: CrudSchema.TCrudFindOneRequest,
  ): Promise<CrudSchema.TCrudFindOneResponse> {
    const result = await this.crudService.findOne(req.id);
    if (!result) return null;
    return { id: result.id, content: result.content };
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: ZCrudUpdateRequest,
    output: ZCrudUpdateResponse,
  })
  async updateCrud(
    @Input() req: CrudSchema.TCrudUpdateRequest,
  ): Promise<CrudSchema.TCrudUpdateResponse> {
    const updated = await this.crudService.update(req.id, req.data.content);
    return {
      success: updated != null,
      data: updated ? { id: updated.id, content: updated.content } : undefined,
      message: updated ? 'Item updated successfully' : 'Failed to update item',
    };
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: ZCrudDeleteRequest,
    output: ZCrudDeleteResponse,
  })
  async deleteCrud(
    @Input() req: CrudSchema.TCrudDeleteRequest,
  ): Promise<CrudSchema.TCrudDeleteResponse> {
    const deleted = await this.crudService.delete(req.id);
    return {
      success: deleted != null,
      message: deleted ? 'Item deleted successfully' : 'Failed to delete item',
    };
  }
}
