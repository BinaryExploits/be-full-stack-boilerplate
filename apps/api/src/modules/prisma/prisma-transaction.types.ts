import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from './prisma.service';

/**
 * Type alias for the Prisma transaction adapter with custom PrismaService
 * This avoids verbose type annotations throughout the codebase
 */
export type PrismaTransactionAdapter = TransactionalAdapterPrisma<PrismaService>;
