// @ts-check
import { config as baseConfig } from "./base.js";

/**
 * ESLint configuration for Expo projects.
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
      "expo-env.d.ts",
      ".expo/**",
      ".android/**",
      ".ios/**",
      "./scripts/**"
    ],
  },
];