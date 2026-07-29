import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Playwright artifacts: ESLint does not read .gitignore, so without these
    // a local test run leaves a bundled HTML report for `pnpm lint` to crawl.
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
