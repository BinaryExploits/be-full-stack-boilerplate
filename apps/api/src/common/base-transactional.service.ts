import { Transactional } from '@nestjs-cls/transactional';

/**
 * Base service class that provides automatic transaction wrapping
 * All public methods that modify data should use the transaction wrapper
 */
export abstract class BaseTransactionalService {
  /**
   * Wrap any async operation in a transaction
   * Use this in your service methods that need transactions
   *
   * @example
   * async createUser(data: CreateUserDto) {
   *   return this.runInTransaction(() => {
   *     // All operations here are transactional
   *   });
   * }
   */
  @Transactional()
  protected async runInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    return operation();
  }
}
