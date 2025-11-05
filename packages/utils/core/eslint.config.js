// @ts-check
import { config as baseConfig } from "@repo/eslint-config/base";
import tseslint from "typescript-eslint";

export default tseslint.config(...baseConfig, {
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  // Add Next.js specific overrides here if needed
});