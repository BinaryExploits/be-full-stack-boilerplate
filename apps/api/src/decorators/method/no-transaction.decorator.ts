import { SetMetadata } from '@nestjs/common';
import { NO_TRANSACTION_KEY } from '../constants';

// Decorator to indicate that a method should not be wrapped in a database transaction
export const NoTransaction = (reasonToDisable: string) =>
  SetMetadata(NO_TRANSACTION_KEY, {
    transactionDisabled: true,
    disableReason: reasonToDisable,
  });
