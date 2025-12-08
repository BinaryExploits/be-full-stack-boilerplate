import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard that validates if write methods have transactions enabled
 * This runs at runtime to catch missing @Transactional decorators
 *
 * Enable globally in main.ts:
 * ```typescript
 * app.useGlobalGuards(new TransactionCheckGuard(app.get(Reflector)));
 * ```
 */
@Injectable()
export class TransactionCheckGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Only check in development/test environments
    if (process.env.NODE_ENV === 'production') {
      return true;
    }

    const handler = context.getHandler();
    const className = context.getClass().name;
    const methodName = handler.name;

    // Skip if method is explicitly marked with @NoTransaction
    const noTransaction = this.reflector.get<boolean>(
      'no-transaction',
      handler
    );
    if (noTransaction) {
      return true;
    }

    // Check if method name suggests it's a write operation
    const writePatterns = [
      /^create/i,
      /^update/i,
      /^delete/i,
      /^remove/i,
      /^save/i,
      /^upsert/i,
      /^insert/i,
    ];

    const isWriteMethod = writePatterns.some(pattern =>
      pattern.test(methodName)
    );

    if (isWriteMethod) {
      // Check if @Transactional or @RequiresTransaction is present
      const hasTransactional = this.reflector.get<boolean>(
        'transactional',
        handler
      );
      const requiresTransaction = this.reflector.get<boolean>(
        'requires-transaction',
        handler
      );

      if (!hasTransactional && !requiresTransaction) {
        console.warn(
          `⚠️  [TransactionCheck] ${className}.${methodName}() appears to be a write method but doesn't have @Transactional decorator. ` +
          `Add @Transactional() or @NoTransaction() to explicitly mark transaction behavior.`
        );

        // In strict mode, you can throw an error instead:
        // throw new Error(`${className}.${methodName}() requires @Transactional decorator`);
      }
    }

    return true;
  }
}
