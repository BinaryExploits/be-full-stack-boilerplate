// @ts-check
import { config as expoConfig } from "@repo/eslint-config/expo";
import tseslint from "typescript-eslint";

export default tseslint.config(...expoConfig, {
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});