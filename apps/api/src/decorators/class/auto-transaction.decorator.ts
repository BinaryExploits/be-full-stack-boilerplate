import 'reflect-metadata';
import {
  Transactional,
  Propagation,
  type TransactionalAdapter,
} from '@nestjs-cls/transactional';
import { NO_TRANSACTION_KEY } from '../constants';

type TOptionsFromAdapter<TAdapter> =
  TAdapter extends TransactionalAdapter<any, any, infer TOptions>
    ? TOptions
    : never;

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
      throw new TypeError(
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

    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor') {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(proto, name);
      if (!descriptor) {
        continue;
      }

      if (typeof descriptor.value !== 'function') {
        continue;
      }

      const noTransaction = Reflect.hasMetadata(
        NO_TRANSACTION_KEY,
        descriptor.value as object,
      );

      if (noTransaction) {
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

      Object.defineProperty(proto, name, descriptor);
    }
  };
}
