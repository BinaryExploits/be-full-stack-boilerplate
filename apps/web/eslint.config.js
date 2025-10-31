// @ts-check
import { config as nextConfig } from "@repo/eslint-config/next-js";
import tseslint from "typescript-eslint";

export default tseslint.config(...nextConfig, {
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  // Add Next.js specific overrides here if needed
});