import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // NM B2B can be slow sometimes, set test timeout to 20s
    testTimeout: 20000,
    coverage: {
      include: ['src/**/*'],
      exclude: [...(configDefaults.coverage.exclude ?? []), '**/*.test-d.ts'],
    },
  },
});
