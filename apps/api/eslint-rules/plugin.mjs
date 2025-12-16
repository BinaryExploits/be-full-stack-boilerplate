import { requireTransaction } from './require-transaction.mjs';

export const plugin = {
  rules: {
    'require-transactional': requireTransaction,
  },
};
