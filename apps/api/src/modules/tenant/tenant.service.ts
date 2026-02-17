import { Injectable } from '@nestjs/common';
import { TenantContext, TenantInfo } from './tenant.context';
import type {
  TTenantCreateRequest,
  TTenantUpdateRequest,
} from './tenant.schema';
import { TenantPrismaRepository } from './repositories/prisma/tenant.prisma-repository';
import { AutoTransaction } from '../../decorators/class/auto-transaction.decorator';
import { ServerConstants } from '../../constants/server.constants';
import { Propagation } from '@nestjs-cls/transactional';

@Injectable()
@AutoTransaction(
  ServerConstants.TransactionConnectionNames.Prisma,
  Propagation.Required,
)
export class TenantService {
  constructor(
    private readonly tenantRepository: TenantPrismaRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async create(data: TTenantCreateRequest): Promise<TenantInfo> {
    const tenant = await this.tenantRepository.create({
      data: {
        name: data.name,
        slug: data.slug,
        allowedOrigins: data.allowedOrigins,
      },
    });
    return this.toTenantInfo(tenant);
  }

  async findAll(): Promise<TenantInfo[]> {
    const list = await this.tenantRepository.findMany({
      orderBy: { slug: 'asc' },
    });
    return list.map((t) => this.toTenantInfo(t));
  }

  async findOne(id: string): Promise<TenantInfo | null> {
    const tenant = await this.tenantRepository.findUnique({
      where: { id },
    });
    return tenant ? this.toTenantInfo(tenant) : null;
  }

  async findBySlug(slug: string): Promise<TenantInfo | null> {
    const tenant = await this.tenantRepository.findUnique({
      where: { slug },
    });
    return tenant ? this.toTenantInfo(tenant) : null;
  }

  async update(
    id: string,
    data: Omit<TTenantUpdateRequest, 'id'>,
  ): Promise<TenantInfo> {
    const tenant = await this.tenantRepository.update({
      where: { id },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.slug != null && { slug: data.slug }),
        ...(data.allowedOrigins != null && {
          allowedOrigins: data.allowedOrigins,
        }),
      },
    });
    return this.toTenantInfo(tenant);
  }

  async delete(id: string): Promise<void> {
    await this.tenantRepository.delete({ where: { id } });
  }

  /** Current request tenant (from CLS). */
  getCurrentTenant(): TenantInfo | null {
    return this.tenantContext.getTenant();
  }

  private toTenantInfo(row: {
    id: string;
    name: string;
    slug: string;
    allowedOrigins: string[];
    createdAt: Date;
    updatedAt: Date;
  }): TenantInfo {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      allowedOrigins: row.allowedOrigins,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
