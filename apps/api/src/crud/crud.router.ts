import { Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc';
import { CrudService } from './crud.service';
import * as CrudSchema from '../schemas/crud.schema';

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
} from '../schemas/crud.schema';

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
    const created = await this.crudService.createCrud(req);
    return {
      success: created != null,
      id: created?.id,
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
  async findOneCrud(
    @Input() req: CrudSchema.TCrudFindOneRequest,
  ): Promise<CrudSchema.TCrudFindOneResponse> {
    const result = await this.crudService.findOne(req.id);
    return result ?? null;
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: ZCrudUpdateRequest,
    output: ZCrudUpdateResponse,
  })
  async updateCrud(
    @Input() req: CrudSchema.TCrudUpdateRequest,
  ): Promise<CrudSchema.TCrudUpdateResponse> {
    const updated = await this.crudService.update(req.id, req.data);
    return {
      success: updated != null,
      data: updated ?? undefined,
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
