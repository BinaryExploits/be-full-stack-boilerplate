import 'reflect-metadata';
import { Transactional } from '@nestjs-cls/transactional';
import { NO_TRANSACTION_KEY } from '../../constants';

/**
 * Class decorator that automatically applies @Transactional to all methods,
 * except those marked with @NoTransaction.
 */
export function AutoTransaction(): ClassDecorator {
  return (target) => {
    const proto = target.prototype as Record<string, unknown>;

    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor') continue;

      const descriptor = Object.getOwnPropertyDescriptor(proto, name);
      if (!descriptor || typeof descriptor.value !== 'function') continue;

      const keys = Reflect.getMetadataKeys(proto, name);
      console.log(keys);

      // Skip methods marked with @NoTransaction
      const noTransaction = Reflect.hasMetadata(
        NO_TRANSACTION_KEY,
        proto,
        name,
      );

      if (noTransaction) {
        continue;
      }

      const transactionalDescriptor = Transactional()(proto, name, descriptor);
      Object.defineProperty(proto, name, transactionalDescriptor || descriptor);

      console.log(
        `[AutoTransaction] Applied @Transactional to method: ${name}`,
      );
    }
  };
}
