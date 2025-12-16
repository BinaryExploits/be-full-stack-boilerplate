import 'reflect-metadata';
import {
  Transactional,
  Propagation,
  type TransactionalAdapter,
} from '@nestjs-cls/transactional';
import { NO_TRANSACTION_KEY } from '../constants';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

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
    if (typeof target !== 'function') {
      throw new Error(
        `@AutoTransaction can only be used on classes, but the target is not a function.`,
      );
    }

    const className = target.name;
    const proto = target.prototype as Record<string, unknown>;

    if (!proto) {
      throw new Error(
        `@AutoTransaction failed on ${className}: Target has no prototype`,
      );
    }

    if (proto.constructor !== target) {
      throw new Error(
        `@AutoTransaction can only be used on classes, but ${className || 'the target'} does not appear to be a class constructor.`,
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

      const originalFunctionRef = descriptor.value as object;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      (Transactional as any)(firstParam, secondParam, thirdParam)(
        proto,
        name,
        descriptor,
      );

      if (originalFunctionRef === descriptor.value) {
        throw new Error(
          `@AutoTransaction has not been applied on ${className}.${name}: ` +
            `Function reference unchanged.`,
        );
      }

      logger.log(className, `✓ ${name}: Function wrapped in transaction proxy`);

      Object.defineProperty(proto, name, descriptor);

      methodsProcessed.push(name);
    }

    logger.log(className, `@AutoTransaction decorator applied`);

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

    if (
      methodsProcessed.length === 0 &&
      methodsWithNoTransaction.length === 0
    ) {
      logger.log(
        className,
        `⚠ Warning: No methods were wrapped. This may indicate the decorator is applied to a class with no methods.`,
      );
    }

    logger.log(className, `Process directory: ${logger.getProcessDir()}`);
  };
}
