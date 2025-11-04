// @ts-check
import { config as baseConfig } from "./base.js";

/**
 * ESLint configuration for Next.js projects.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  {
    ignores: [
      "eslint.config.js",
      "postcss.config.js",
      "tailwind.config.js",
      "next-env.d.ts",
      ".next/**",
    ],
  },
];