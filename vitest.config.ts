import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

/**
 * Vitest setup for pure-function unit tests.
 *
 * - `environment: 'node'` — these tests cover pure utilities/validation only (no DOM).
 * - `@/` alias mirrors tsconfig `paths` so imports resolve the same way as the app.
 * - `include` is scoped to colocated `*.test.ts` files under `src/`.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
    },
  },
})
