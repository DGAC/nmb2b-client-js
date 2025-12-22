import { configDefaults, defineConfig } from 'vitest/config';
import { resolveB2BEnvironment } from './tests/resolveB2BEnvironment.js';
import { MOCK_B2B_ENDPOINT, MOCK_B2B_XSD_ENDPOINT } from './tests/constants.js';

const b2bEnv = resolveB2BEnvironment();

export default defineConfig({
  test: {
    globalSetup: ['./tests/ensureWSDLPresence.ts'],
    coverage: {
      include: ['src/**/*'],
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        '**/*.test-d.ts',
        '**/__fixtures__/**',
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          exclude: ['src/**/*.e2e.test.ts', ...configDefaults.exclude],
          setupFiles: ['./tests/setupMsw.ts'],
          env: removeUndefined({
            ...b2bEnv,
            B2B_API_KEY_ID: 'mock-api-key-id',
            B2B_API_SECRET_KEY: 'mock-api-secret-key',
            B2B_ENDPOINT: MOCK_B2B_ENDPOINT,
            B2B_XSD_REMOTE_URL: MOCK_B2B_XSD_ENDPOINT,

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
export function removeUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
    // oxlint-disable-next-line no-unsafe-type-assertion -- This is fine, we're returning a wider type.
  ) as T;
}
