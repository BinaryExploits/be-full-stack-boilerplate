// @ts-check
import { config as baseConfig } from "@repo/eslint-config/base";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...baseConfig,
  {
    ignores: ["eslint.config.js"],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);