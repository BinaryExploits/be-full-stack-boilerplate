import { Transactional } from '@nestjs-cls/transactional';

/**
 * List of method names that should automatically be wrapped in transactions
 * Customize this list based on your conventions
 */
const WRITE_METHOD_PATTERNS = [
  /^create/i,    // createUser, createOrder, etc.
  /^update/i,    // updateUser, updateOrder, etc.
  /^delete/i,    // deleteUser, deleteOrder, etc.
  /^remove/i,    // removeUser, removeOrder, etc.
  /^save/i,      // saveUser, saveOrder, etc.
  /^upsert/i,    // upsertUser, upsertOrder, etc.
  /^insert/i,    // insertUser, insertOrder, etc.
  /^register/i,  // registerUser, etc.
  /^activate/i,  // activateUser, etc.
  /^deactivate/i, // deactivateUser, etc.
  /^archive/i,   // archiveUser, etc.
];

/**
 * Class decorator that automatically applies @Transactional() to write methods
 *
 * Usage:
 * ```typescript
 * @Injectable()
 * @AutoTransactional()
 * export class UserService {
 *   async createUser() { } // ✅ Automatically transactional
 *   async updateUser() { } // ✅ Automatically transactional
 *   async findUser() { }   // ❌ Not transactional (doesn't match pattern)
 * }
 * ```
 */
export function AutoTransactional(options?: {
  /**
   * Additional method patterns to consider as write operations
   */
  additionalPatterns?: RegExp[];

  /**
   * Exclude specific method names from auto-transaction
   */
  exclude?: string[];

  /**
   * Transaction options to apply to all methods
   */
  transactionOptions?: Parameters<typeof Transactional>[0];
}): ClassDecorator {
  return function (target: any) {
    const patterns = [
      ...WRITE_METHOD_PATTERNS,
      ...(options?.additionalPatterns || []),
    ];
    const exclude = options?.exclude || [];

    // Get all method names from the prototype
    const methodNames = Object.getOwnPropertyNames(target.prototype)
      .filter(name => {
        // Skip constructor and excluded methods
        if (name === 'constructor' || exclude.includes(name)) {
          return false;
        }

        // Check if method matches any write pattern
        return patterns.some(pattern => pattern.test(name));
      });

    // Apply @Transactional to matching methods
    methodNames.forEach(methodName => {
      const originalMethod = target.prototype[methodName];

      // Skip if not a function
      if (typeof originalMethod !== 'function') {
        return;
      }

      // Check if already has @Transactional metadata
      const existingMetadata = Reflect.getMetadata(
        'transactional',
        target.prototype,
        methodName
      );

      if (existingMetadata) {
        // Already has @Transactional, skip
        return;
      }

      // Apply @Transactional decorator
      const transactionalDecorator = Transactional(options?.transactionOptions);

      // Apply to the method
      const descriptor = Object.getOwnPropertyDescriptor(
        target.prototype,
        methodName
      );

      if (descriptor) {
        transactionalDecorator(target.prototype, methodName, descriptor);
        Object.defineProperty(target.prototype, methodName, descriptor);
      }
    });

    return target;
  };
}

/**
 * Method decorator to explicitly mark a method as requiring a transaction
 * This is mainly for documentation purposes and runtime validation
 *
 * Usage:
 * ```typescript
 * @RequiresTransaction()
 * async customWriteMethod() { }
 * ```
 */
export function RequiresTransaction(
  options?: Parameters<typeof Transactional>[0]
): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    // Mark with metadata
    Reflect.defineMetadata('requires-transaction', true, target, propertyKey);

    // Apply @Transactional
    return Transactional(options)(target, propertyKey, descriptor);
  };
}

/**
 * Method decorator to explicitly exclude a method from auto-transaction
 *
 * Usage:
 * ```typescript
 * @NoTransaction()
 * async createBatch() {
 *   // This handles its own transaction logic
 * }
 * ```
 */
export function NoTransaction(): MethodDecorator {
  return function (target: any, propertyKey: string | symbol) {
    Reflect.defineMetadata('no-transaction', true, target, propertyKey);
  };
}
