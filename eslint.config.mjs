import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeCheckedOnly,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['coverage/', 'dist/', 'scripts/', 'eslint.config.mjs'],
  },
  {
    // disable `any` checks in tests
    files: ['src/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
);
