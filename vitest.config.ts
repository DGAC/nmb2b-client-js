import { configDefaults, defineConfig } from 'vitest/config';
import { resolveB2BEnvironment } from './tests/resolveB2BEnvironment.js';

const b2bEnv = resolveB2BEnvironment();

export default defineConfig({
  test: {
    globalSetup: ['./tests/ensureWSDLPresence.ts'],
    coverage: {
      include: ['src/**/*'],
      exclude: [...(configDefaults.coverage.exclude ?? []), '**/*.test-d.ts'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          exclude: ['src/**/*.e2e.test.ts', ...configDefaults.exclude],
          env: removeUndefined({
            ...b2bEnv,
            // Isolation: Mock security for unit tests to prevent real connection attempts
            B2B_API_KEY_ID: 'mock-api-key-id',
            B2B_API_SECRET_KEY: 'mock-api-secret-key',
            B2B_ENDPOINT: 'https://fake-b2b.test',
            B2B_CERT: undefined,
            B2B_CERT_KEY: undefined,
            B2B_CERT_PASSPHRASE: undefined,
            B2B_CERT_FORMAT: undefined,
          }),
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          include: ['src/**/*.e2e.test.ts'],
          testTimeout: 20000,
          env: removeUndefined(b2bEnv),
        },
      },
    ],
  },
});

/**
 * Removes undefined keys from an object for Vitest environment injection.
 *
 * If not, vitest will convert undefined to 'undefined' (string).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function removeUndefined<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  ) as T;
}
