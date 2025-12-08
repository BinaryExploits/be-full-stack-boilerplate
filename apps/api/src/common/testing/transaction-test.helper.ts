/**
 * Test helper to verify that services have proper transaction decorators
 * Use this in your unit tests to enforce transaction usage
 */

/**
 * Verify that a service class has @Transactional on write methods
 *
 * Usage in tests:
 * ```typescript
 * describe('UserService', () => {
 *   it('should have @Transactional on write methods', () => {
 *     verifyTransactionalMethods(UserService, ['createUser', 'updateUser', 'deleteUser']);
 *   });
 * });
 * ```
 */
export function verifyTransactionalMethods(
  serviceClass: any,
  methodNames: string[]
): void {
  methodNames.forEach(methodName => {
    const hasMetadata = Reflect.getMetadata(
      'transactional',
      serviceClass.prototype,
      methodName
    ) || Reflect.getMetadata(
      'requires-transaction',
      serviceClass.prototype,
      methodName
    );

    if (!hasMetadata) {
      throw new Error(
        `${serviceClass.name}.${methodName}() is missing @Transactional decorator`
      );
    }
  });
}

/**
 * Scan a service and find all write methods without @Transactional
 *
 * Usage:
 * ```typescript
 * const missing = findMissingTransactionalDecorators(UserService);
 * expect(missing).toEqual([]);
 * ```
 */
export function findMissingTransactionalDecorators(serviceClass: any): string[] {
  const writePatterns = [
    /^create/i,
    /^update/i,
    /^delete/i,
    /^remove/i,
    /^save/i,
    /^upsert/i,
  ];

  const methodNames = Object.getOwnPropertyNames(serviceClass.prototype)
    .filter(name => {
      if (name === 'constructor') return false;

      const method = serviceClass.prototype[name];
      return typeof method === 'function';
    });

  const missingDecorators: string[] = [];

  methodNames.forEach(methodName => {
    const isWriteMethod = writePatterns.some(pattern =>
      pattern.test(methodName)
    );

    if (isWriteMethod) {
      const hasTransactional = Reflect.getMetadata(
        'transactional',
        serviceClass.prototype,
        methodName
      );
      const requiresTransaction = Reflect.getMetadata(
        'requires-transaction',
        serviceClass.prototype,
        methodName
      );
      const noTransaction = Reflect.getMetadata(
        'no-transaction',
        serviceClass.prototype,
        methodName
      );

      if (!hasTransactional && !requiresTransaction && !noTransaction) {
        missingDecorators.push(methodName);
      }
    }
  });

  return missingDecorators;
}
