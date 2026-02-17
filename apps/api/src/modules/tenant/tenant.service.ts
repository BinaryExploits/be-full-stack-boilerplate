import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext, TenantInfo } from './tenant.context';
import { AutoTransaction } from '../../decorators/class/auto-transaction.decorator';
import { ServerConstants } from '../../constants/server.constants';
import { Propagation } from '@nestjs-cls/transactional';

export interface CreateTenantInput {
  name: string;
  slug: string;
  allowedOrigins: string[];
}

export interface UpdateTenantInput {
  name?: string;
  slug?: string;
  allowedOrigins?: string[];
}

@Injectable()
export class TenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  async create(data: CreateTenantInput): Promise<TenantInfo> {
    const tenant = await this.prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        allowedOrigins: data.allowedOrigins,
      },
    });
    return this.toTenantInfo(tenant);
  }

  async findAll(): Promise<TenantInfo[]> {
    const list = await this.prisma.tenant.findMany({
      orderBy: { slug: 'asc' },
    });
    return list.map((t) => this.toTenantInfo(t));
  }

  async findOne(id: string): Promise<TenantInfo | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });
    return tenant ? this.toTenantInfo(tenant) : null;
  }

  async findBySlug(slug: string): Promise<TenantInfo | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    return tenant ? this.toTenantInfo(tenant) : null;
  }

  async update(id: string, data: UpdateTenantInput): Promise<TenantInfo> {
    const tenant = await this.prisma.tenant.update({
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
    await this.prisma.tenant.delete({ where: { id } });
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
  }): TenantInfo {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      allowedOrigins: row.allowedOrigins,
    };
  }
}
