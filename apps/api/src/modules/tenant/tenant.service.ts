import { Injectable } from '@nestjs/common';
import { Tenant } from '@repo/prisma-db';
import { TenantContext } from './tenant.context';
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

  async create(data: TTenantCreateRequest): Promise<Tenant> {
    return this.tenantRepository.create({
      data: {
        name: data.name,
        slug: data.slug,
        allowedOrigins: data.allowedOrigins,
      },
    });
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.findMany({
      orderBy: { slug: 'asc' },
    });
  }

  async findOne(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.tenantRepository.findUnique({
      where: { slug },
    });
  }

  async update(
    id: string,
    data: Omit<TTenantUpdateRequest, 'id'>,
  ): Promise<Tenant> {
    return this.tenantRepository.update({
      where: { id },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.slug != null && { slug: data.slug }),
        ...(data.allowedOrigins != null && {
          allowedOrigins: data.allowedOrigins,
        }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.tenantRepository.delete({ where: { id } });
  }

  /** Current request tenant (from CLS). */
  getCurrentTenant(): Tenant | null {
    return this.tenantContext.getTenant();
  }
}
