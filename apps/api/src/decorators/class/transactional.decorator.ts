import 'reflect-metadata';
import {
  Transactional,
  Propagation,
  type TransactionalAdapter,
} from '@nestjs-cls/transactional';
import { NO_TRANSACTION_KEY } from '../constants';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

// Type helper to extract transaction options from adapter
type TOptionsFromAdapter<TAdapter> =
  TAdapter extends TransactionalAdapter<any, any, infer TOptions>
    ? TOptions
    : never;

class TransactionalLogger {
  private readonly processDir: string;

  constructor() {
    const baseLogDir = join(process.cwd(), 'tmp', 'transaction');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 8);
    const processId = `${timestamp}_${random}`;

    this.processDir = join(baseLogDir, processId);
    mkdirSync(this.processDir, { recursive: true });

    this.log('Session', 'Transaction validation session started');
    this.log('Session', `Process ID: ${processId}`);
    this.log('Session', `Log directory: ${this.processDir}`);
  }

  log(className: string, message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    const classLogFile = join(this.processDir, `${className}.log`);

    writeFileSync(classLogFile, logMessage + '\n', {
      flag: 'a',
      encoding: 'utf-8',
    });

    // console.log(`[${timestamp}] [${className}] ${message}`);
  }

  getProcessDir(): string {
    return this.processDir;
  }
}

const logger = new TransactionalLogger();

/**
 * Validates that a descriptor was successfully modified by the @AutoTransaction decorator
 * Transactional mutates the descriptor in place by replacing descriptor.value with a Proxy.
 * We validate that the mutation occurred by comparing the original function reference.
 */
function validateTransactionalApplication(
  className: string,
  methodName: string,
  originalDescriptor: PropertyDescriptor,
  mutatedDescriptor: PropertyDescriptor,
): PropertyDescriptor {
  if (!mutatedDescriptor.value && !mutatedDescriptor.get) {
    throw new Error(
      `@AutoTransaction failed to apply on ${className}.${methodName}: ` +
        `Descriptor has no value or getter after decoration`,
    );
  }

  if (
    mutatedDescriptor.value &&
    typeof mutatedDescriptor.value !== 'function'
  ) {
    throw new Error(
      `@AutoTransaction failed to apply on ${className}.${methodName}: ` +
        `Descriptor value is not a function (got ${typeof mutatedDescriptor.value})`,
    );
  }

  // CRITICAL: Validate that the function was actually wrapped (changed reference)
  // If the decorator returns void, it should have mutated the descriptor in place
  // If it returns a new descriptor, the function reference should be different
  const originalFunction = originalDescriptor.value as
    | ((...args: unknown[]) => unknown)
    | undefined;
  const finalFunction = mutatedDescriptor.value as
    | ((...args: unknown[]) => unknown)
    | undefined;

  if (
    !originalFunction ||
    !finalFunction ||
    originalFunction === finalFunction
  ) {
    throw new Error(
      `@AutoTransaction have not been been applied on ${className}.${methodName}: ` +
        `Function reference unchanged or function(s) undefined.` +
        `Original: ${originalFunction?.name}, Final: ${finalFunction?.name}`,
    );
  } else {
    logger.log(
      className,
      `✓ ${methodName}: Function reference changed (wrapped)`,
    );
  }

  // Validate that writable/configurable flags are appropriate
  if (
    mutatedDescriptor.value &&
    mutatedDescriptor.writable === false &&
    originalDescriptor.writable === true
  ) {
    throw new Error(
      `@AutoTransaction failed to apply on ${className}.${methodName}: ` +
        `Method became non-writable after decoration`,
    );
  }

  return mutatedDescriptor;
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
      `@AutoTransaction failed to apply on ${className}.${methodName}: ` +
        `Property descriptor not found after Object.defineProperty`,
    );
  }

  if (!finalDescriptor.value && !finalDescriptor.get) {
    throw new Error(
      `@AutoTransaction failed to apply on ${className}.${methodName}: ` +
        `Final property has no value or getter`,
    );
  }

  if (finalDescriptor.value && typeof finalDescriptor.value !== 'function') {
    throw new Error(
      `@AutoTransaction failed to apply on ${className}.${methodName}: ` +
        `Final property value is not a function (got ${typeof finalDescriptor.value})`,
    );
  }
}

/**
 * Helper function to check if a parameter is a Propagation enum value
 */
function paramIsPropagationMode(param: unknown): param is Propagation {
  return (
    typeof param === 'string' &&
    Object.values(Propagation).includes(param as Propagation)
  );
}

/**
 * Helper function to detect and parse the parameters passed to @AutoTransaction
 */
function detectTransactionalParameters<TAdapter>(
  firstParam?: string | Propagation | TOptionsFromAdapter<TAdapter>,
  secondParam?: Propagation | TOptionsFromAdapter<TAdapter>,
  thirdParam?: TOptionsFromAdapter<TAdapter>,
): {
  connectionName?: string;
  propagation?: Propagation;
  options?: TOptionsFromAdapter<TAdapter>;
} {
  let connectionName: string | undefined;
  let propagation: Propagation | undefined;
  let options: TOptionsFromAdapter<TAdapter> | undefined;

  if (thirdParam !== undefined) {
    connectionName = firstParam as string;
    propagation = secondParam as Propagation;
    options = thirdParam;
  } else if (secondParam !== undefined) {
    if (typeof firstParam === 'string') {
      connectionName = firstParam;
      if (paramIsPropagationMode(secondParam)) {
        propagation = secondParam;
      } else {
        options = secondParam as TOptionsFromAdapter<TAdapter>;
      }
    } else if (paramIsPropagationMode(firstParam)) {
      propagation = firstParam;
      options = secondParam as TOptionsFromAdapter<TAdapter>;
    }
  } else if (firstParam !== undefined) {
    if (typeof firstParam === 'string') {
      connectionName = firstParam;
    } else if (paramIsPropagationMode(firstParam)) {
      propagation = firstParam;
    } else {
      options = firstParam;
    }
  }

  return { connectionName, propagation, options };
}

/**
 * Run the decorated class methods in a transaction.
 *
 * @param options Transaction options depending on the adapter.
 */
export function AutoTransaction<TAdapter = any>(
  options?: TOptionsFromAdapter<TAdapter>,
): ClassDecorator;
/**
 * Run the decorated class methods in a transaction.
 *
 * @param propagation The propagation mode to use, @see{Propagation}.
 */
export function AutoTransaction(propagation?: Propagation): ClassDecorator;
/**
 * Run the decorated class methods in a transaction.
 *
 * @param connectionName The name of the connection to use.
 */
export function AutoTransaction(connectionName?: string): ClassDecorator;
/**
 * Run the decorated class methods in a transaction.
 *
 * @param connectionName The name of the connection to use.
 * @param options Transaction options depending on the adapter.
 */
export function AutoTransaction<TAdapter = any>(
  connectionName: string,
  options?: TOptionsFromAdapter<TAdapter>,
): ClassDecorator;
/**
 * Run the decorated class methods in a transaction.
 *
 * @param connectionName The name of the connection to use.
 * @param propagation The propagation mode to use, @see{Propagation}.
 */
export function AutoTransaction(
  connectionName: string,
  propagation?: Propagation,
): ClassDecorator;
/**
 * Run the decorated class methods in a transaction.
 *
 * @param propagation The propagation mode to use, @see{Propagation}.
 * @param options Transaction options depending on the adapter.
 */
export function AutoTransaction<TAdapter = any>(
  propagation: Propagation,
  options?: TOptionsFromAdapter<TAdapter>,
): ClassDecorator;
/**
 * Run the decorated class methods in a transaction.
 * @param connectionName The name of the connection to use.
 * @param propagation The propagation mode to use, @see{Propagation}.
 * @param options Transaction options depending on the adapter.
 */
export function AutoTransaction<TAdapter = any>(
  connectionName: string,
  propagation: Propagation,
  options?: TOptionsFromAdapter<TAdapter>,
): ClassDecorator;
export function AutoTransaction<TAdapter = any>(
  firstParam?: string | Propagation | TOptionsFromAdapter<TAdapter>,
  secondParam?: Propagation | TOptionsFromAdapter<TAdapter>,
  thirdParam?: TOptionsFromAdapter<TAdapter>,
): ClassDecorator {
  return (target) => {
    const className = target.name;
    const proto = target.prototype as Record<string, unknown>;

    // Validate that the target has a prototype
    if (!proto) {
      throw new Error(
        `@AutoTransaction failed on ${className}: Target has no prototype`,
      );
    }

    // Detect and log which parameters were provided
    const detectedParams = detectTransactionalParameters(
      firstParam,
      secondParam,
      thirdParam,
    );
    logger.log(className, `@AutoTransaction decorator configuration:`);
    logger.log(
      className,
      `  - Connection: ${detectedParams.connectionName || 'default'}`,
    );
    logger.log(
      className,
      `  - Propagation: ${detectedParams.propagation || 'REQUIRED (default)'}`,
    );
    logger.log(
      className,
      `  - Options: ${detectedParams.options ? JSON.stringify(detectedParams.options) : 'none'}`,
    );

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

      // Apply the @Transactional decorator with the appropriate parameters
      // Note: Transactional ALWAYS mutates the descriptor in place and returns void
      if (thirdParam !== undefined) {
        // Three arguments: connectionName, propagation, options
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        (Transactional as any)(firstParam, secondParam, thirdParam)(
          proto,
          name,
          descriptor,
        );
      } else if (secondParam !== undefined) {
        // Two arguments: could be connectionName + options/propagation, or propagation + options
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        (Transactional as any)(firstParam, secondParam)(
          proto,
          name,
          descriptor,
        );
      } else if (firstParam !== undefined) {
        // One argument: could be connectionName, propagation, or options
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        (Transactional as any)(firstParam)(proto, name, descriptor);
      } else {
        // No arguments
        Transactional()(proto, name, descriptor);
      }

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
