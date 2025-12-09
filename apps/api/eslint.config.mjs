// @ts-check
import { config as baseConfig } from '@repo/eslint-config/base';
import tseslint from 'typescript-eslint';
import { plugin as customPlugin } from './eslint-rules/plugin.mjs';

export default tseslint.config(
  ...baseConfig,
  {
    ignores: ['eslint.config.mjs', 'src/generated/**'],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      custom: customPlugin,
    },
    rules: {
      'custom/require-transactional': 'warn',
    },
  },
);
