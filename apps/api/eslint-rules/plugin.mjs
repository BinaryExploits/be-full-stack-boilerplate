// eslint-rules/plugin.js
import { requireTransactional } from './require-transactional.mjs';

export const plugin = {
  rules: {
    'require-transactional': requireTransactional,
  },
};
