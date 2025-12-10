import { createRequire } from 'module';
import typescriptEslint from 'typescript-eslint';

const require = createRequire(import.meta.url);

// Import Next.js ESLint config (it's already in flat config format in v16)
const nextConfig = require('eslint-config-next');

export default [
  ...nextConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
    },
  },
];
