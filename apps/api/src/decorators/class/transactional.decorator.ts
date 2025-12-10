import 'reflect-metadata';
import { Transactional as ClsTransactional } from '@nestjs-cls/transactional';
import { NO_TRANSACTION_KEY } from '../constants';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

// Logger utility for transaction validation
class TransactionalLogger {
  private processDir: string;
  private processId: string;

  constructor() {
    const baseLogDir = join(process.cwd(), 'tmp', 'transaction');

    // Create unique process ID using timestamp + random string
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 8);
    this.processId = `${timestamp}_${random}`;

    // Create unique directory for this process
    this.processDir = join(baseLogDir, this.processId);
    mkdirSync(this.processDir, { recursive: true });

    this.log('SESSION', 'Transaction validation session started');
    this.log('SESSION', `Process ID: ${this.processId}`);
    this.log('SESSION', `Log directory: ${this.processDir}`);
  }

  log(className: string, message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    // Use a single log file per class (without timestamp in filename)
    const classLogFile = join(this.processDir, `${className}.log`);

    // Append to class-specific file
    writeFileSync(classLogFile, logMessage + '\n', {
      flag: 'a',
      encoding: 'utf-8',
    });

    // console.log(`[${timestamp}] [${className}] ${message}`);
  }

  getProcessDir(): string {
    return this.processDir;
  }

  getProcessId(): string {
    return this.processId;
  }
}

const logger = new TransactionalLogger();

/**
 * Validates that a descriptor was successfully modified by the @Transactional decorator
 * ClsTransactional mutates the descriptor in place by replacing descriptor.value with a Proxy.
 * We validate that the mutation occurred by comparing the original function reference.
 */
function validateTransactionalApplication(
  className: string,
  methodName: string,
  originalDescriptor: PropertyDescriptor,
  mutatedDescriptor: PropertyDescriptor,
): PropertyDescriptor {
  const descriptorToValidate = mutatedDescriptor;

  // Validate that the descriptor has required properties
  if (!descriptorToValidate.value && !descriptorToValidate.get) {
    throw new Error(
      `@Transactional failed to apply on ${className}.${methodName}: ` +
        `Descriptor has no value or getter after decoration`,
    );
  }

  // Validate that the method is still callable
  if (
    descriptorToValidate.value &&
    typeof descriptorToValidate.value !== 'function'
  ) {
    throw new Error(
      `@Transactional failed to apply on ${className}.${methodName}: ` +
        `Descriptor value is not a function (got ${typeof descriptorToValidate.value})`,
    );
  }

  // CRITICAL: Validate that the function was actually wrapped (changed reference)
  // If the decorator returns void, it should have mutated the descriptor in place
  // If it returns a new descriptor, the function reference should be different
  const originalFunction = originalDescriptor.value as
    | ((...args: unknown[]) => unknown)
    | undefined;
  const finalFunction = descriptorToValidate.value as
    | ((...args: unknown[]) => unknown)
    | undefined;

  if (originalFunction && finalFunction) {
    // Check if the function reference changed (indicates wrapping occurred)
    const functionWasWrapped = originalFunction !== finalFunction;

    // Check if the function has metadata added by ClsTransactional
    // The @nestjs-cls/transactional library may add metadata or wrap the function
    const hasClsMetadata =
      Reflect.hasMetadata('__cls_transactional__', finalFunction as object) ||
      Reflect.getMetadataKeys(finalFunction as object).some((key) =>
        String(key).includes('transactional'),
      );

    // Check if function name or properties suggest wrapping
    const originalName = originalFunction.name || '';
    const finalName = finalFunction.name || '';
    const functionNameSuggestsWrapping =
      finalName.includes('wrapped') ||
      finalName.includes('proxy') ||
      finalName === '' || // Arrow functions used in wrapping
      finalName !== originalName;

    // At least ONE of these should be true if decoration was successful
    if (
      !functionWasWrapped &&
      !hasClsMetadata &&
      !functionNameSuggestsWrapping
    ) {
      throw new Error(
        `@Transactional may not have been applied on ${className}.${methodName}: ` +
          `Function reference unchanged and no transactional metadata detected. ` +
          `Original: ${originalName}, Final: ${finalName}`,
      );
    }

    // Log what we detected for debugging
    if (functionWasWrapped) {
      logger.log(
        className,
        `✓ ${methodName}: Function reference changed (wrapped)`,
      );
    } else if (hasClsMetadata) {
      logger.log(className, `✓ ${methodName}: CLS metadata detected`);
    } else if (functionNameSuggestsWrapping) {
      logger.log(
        className,
        `✓ ${methodName}: Function name changed (${originalName} → ${finalName})`,
      );
    }
  }

  // Validate that writable/configurable flags are appropriate
  if (
    descriptorToValidate.value &&
    descriptorToValidate.writable === false &&
    originalDescriptor.writable === true
  ) {
    throw new Error(
      `@Transactional failed to apply on ${className}.${methodName}: ` +
        `Method became non-writable after decoration`,
    );
  }

  return descriptorToValidate;
}

/**
 * Validates that the property was successfully defined on the prototype
 */
function validatePropertyDefinition(
  className: string,
  methodName: string,
  proto: Record<string, unknown>,
): void {
  const finalDescriptor = Object.getOwnPropertyDescriptor(proto, methodName);

  if (!finalDescriptor) {
    throw new Error(
      `@Transactional failed to apply on ${className}.${methodName}: ` +
        `Property descriptor not found after Object.defineProperty`,
    );
  }

  if (!finalDescriptor.value && !finalDescriptor.get) {
    throw new Error(
      `@Transactional failed to apply on ${className}.${methodName}: ` +
        `Final property has no value or getter`,
    );
  }

  if (finalDescriptor.value && typeof finalDescriptor.value !== 'function') {
    throw new Error(
      `@Transactional failed to apply on ${className}.${methodName}: ` +
        `Final property value is not a function (got ${typeof finalDescriptor.value})`,
    );
  }
}

export function Transactional(connectionName?: string): ClassDecorator {
  return (target) => {
    const className = target.name;
    const proto = target.prototype as Record<string, unknown>;

    // Validate that the target has a prototype
    if (!proto) {
      throw new Error(
        `@Transactional failed on ${className}: Target has no prototype`,
      );
    }

    const methodsProcessed: string[] = [];
    const methodsSkipped: string[] = [];
    const methodsWithNoTransaction: string[] = [];

    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor') {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(proto, name);
      if (!descriptor) {
        methodsSkipped.push(`${name} (no descriptor)`);
        continue;
      }

      if (typeof descriptor.value !== 'function') {
        methodsSkipped.push(`${name} (not a function)`);
        continue;
      }

      const noTransaction = Reflect.hasMetadata(
        NO_TRANSACTION_KEY,
        descriptor.value as object,
      );

      if (noTransaction) {
        methodsWithNoTransaction.push(name);
        continue;
      }

      // Save the original function reference BEFORE applying the decorator
      const originalFunctionRef = descriptor.value as
        | ((...args: unknown[]) => unknown)
        | undefined;

      // Apply the @Transactional decorator
      // Note: ClsTransactional ALWAYS mutates the descriptor in place and returns void
      ClsTransactional(connectionName)(proto, name, descriptor);

      // Validate that the decorator was applied correctly
      // The descriptor has been mutated in place, so we validate it directly
      const validatedDescriptor = validateTransactionalApplication(
        className,
        name,
        {
          ...descriptor,
          value: originalFunctionRef,
        } as PropertyDescriptor, // Pass original for comparison
        descriptor, // Pass the mutated descriptor
      );

      // Define the property with the validated descriptor
      Object.defineProperty(proto, name, validatedDescriptor);

      // Validate that the property was defined correctly
      validatePropertyDefinition(className, name, proto);

      methodsProcessed.push(name);
    }

    // Log summary
    logger.log(className, `Summary:`);
    logger.log(
      className,
      `  - Methods wrapped: ${methodsProcessed.length} (${methodsProcessed.join(', ') || 'none'})`,
    );
    logger.log(
      className,
      `  - Methods with @NoTransaction: ${methodsWithNoTransaction.length} (${methodsWithNoTransaction.join(', ') || 'none'})`,
    );
    logger.log(
      className,
      `  - Methods skipped: ${methodsSkipped.length} (${methodsSkipped.join(', ') || 'none'})`,
    );

    // Validation: ensure at least some methods were processed (optional strict check)
    if (
      methodsProcessed.length === 0 &&
      methodsWithNoTransaction.length === 0
    ) {
      logger.log(
        className,
        `⚠ Warning: No methods were wrapped. This may indicate the decorator is applied to a class with no methods.`,
      );
    }

    // Log process directory info
    logger.log(className, `Process directory: ${logger.getProcessDir()}`);
  };
}
