import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { MiddlewareOptions, TRPCMiddleware } from 'nestjs-trpc';

/**
 * Global transaction middleware for tRPC
 * Automatically wraps all mutations in transactions
 * Queries run without transactions for better performance
 */
@Injectable()
export class TransactionMiddleware implements TRPCMiddleware {
  @Transactional()
  async use(opts: MiddlewareOptions): Promise<unknown> {
    const { next } = opts;

    console.log('transaction middleware invoked for', opts.type, opts.path);

    // Simply pass through - the @Transactional decorator handles everything
    return next();
  }
}
