import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['src/components/client/**/*.{js,mjs,ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [
          { name: 'zod', message: 'Client islands must not import content validation dependencies.' },
          { name: 'gray-matter', message: 'Client islands must not import content parsing dependencies.' },
        ],
        patterns: [
          { group: ['node:*'], message: 'Client islands must not import Node.js modules.' },
          { group: ['**/content/validate', '**/content/load', '**/content/check'], message: 'Client islands must not import server content modules.' },
        ],
      }],
    },
  },
  globalIgnores(['.next/**', 'node_modules/**', 'next-env.d.ts']),
]);
