import { defineConfig } from 'oxlint';
import eslintRecommended from 'oxlint-config-presets/@eslint/recommended.json' with { type: 'json' };
import tsStrict from 'oxlint-config-presets/@typescript-eslint/strict-type-checked.json' with { type: 'json' };
import tsStylistic from 'oxlint-config-presets/@typescript-eslint/stylistic-type-checked.json' with { type: 'json' };
import vitest from 'oxlint-config-presets/@vitest/recommended.json' with { type: 'json' };

export default defineConfig({
  extends: [eslintRecommended, tsStrict, tsStylistic, vitest],
  options: {
    typeAware: true,
  },
  env: {
    builtin: true,
    node: true,
  },
  ignorePatterns: ['coverage/', 'dist/'],
  settings: {
    vitest: {
      typecheck: true,
    },
  },
  rules: {
    'typescript/array-type': 'off',
    'typescript/consistent-indexed-object-style': 'off',
    'typescript/consistent-type-definitions': 'off',
    'typescript/restrict-template-expressions': [
      'error',
      {
        allowAny: false,
        allowBoolean: true,
        allowNever: false,
        allowNullish: true,
        allowNumber: true,
        allowRegExp: false,
      },
    ],
  },
  overrides: [
    {
      files: ['src/**/*.test.ts', 'tests/**/*'],
      plugins: ['vitest'],
      rules: {
        'typescript/no-unsafe-assignment': 'off',
        'typescript/no-unsafe-member-access': 'off',
        'typescript/no-unsafe-argument': 'off',

        'vitest/valid-title': 'off',
        'vitest/valid-describe-callback': 'off',
        'vitest/no-conditional-expect': 'off',
        'vitest/require-mock-type-parameters': 'off',
      },
    },
  ],
});
