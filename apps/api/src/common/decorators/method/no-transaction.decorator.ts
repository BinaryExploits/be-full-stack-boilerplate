import { SetMetadata } from '@nestjs/common';
import { NO_TRANSACTION_KEY } from '../../constants';

export const NoTransaction = () => SetMetadata(NO_TRANSACTION_KEY, true);
