import { beforeEach, describe, expect, test, vi } from 'vitest';
import { clearCache, fromEnv } from './security.js';

const usedEnvKeys = [
  'B2B_CERT',
  'B2B_CERT_FORMAT',
  'B2B_CERT_PASSPHRASE',
  'B2B_CERT_KEY',
  'B2B_API_KEY_ID',
  'B2B_API_SECRET_KEY',
];

const EXISTING_FILE = import.meta.filename;

describe(fromEnv, () => {
  beforeEach(() => {
    for (const envKey of usedEnvKeys) {
      vi.stubEnv(envKey, undefined);
    }

    return () => {
      vi.unstubAllEnvs();
      clearCache();
    };
  });

  test('without env variables', () => {
    expect(fromEnv).toThrow(/B2B_CERT/);
  });

  test('with a cert file that does not exist', () => {
    vi.stubEnv('B2B_CERT', 'non-existent-file');
    expect(fromEnv).toThrow(/non-existent-file/);
  });

  test('with a cert file that exists', () => {
    vi.stubEnv('B2B_CERT', EXISTING_FILE);
    expect(fromEnv).not.toThrow();

    const security = fromEnv();
    expect(security).toEqual(
      expect.objectContaining({
        pfx: expect.any(Buffer),
        passphrase: expect.any(String),
      }),
    );
  });

  test('should reject unknown format', () => {
    vi.stubEnv('B2B_CERT', EXISTING_FILE);
    vi.stubEnv('B2B_CERT_FORMAT', 'non-existent-format');
    expect(fromEnv).toThrow(/B2B_CERT_FORMAT/);
  });

  describe('PEM format', () => {
    test('without a key file', () => {
      vi.stubEnv('B2B_CERT', EXISTING_FILE);
      vi.stubEnv('B2B_CERT_FORMAT', 'pem');
      expect(fromEnv).toThrow(/B2B_CERT_KEY/);
    });

    test('with a non existent key file', () => {
      vi.stubEnv('B2B_CERT', EXISTING_FILE);
      vi.stubEnv('B2B_CERT_FORMAT', 'pem');
      vi.stubEnv('B2B_CERT_KEY', 'non-existent-file');
      expect(fromEnv).toThrow(/B2B_CERT_KEY/);
    });

    test('with a proper key file', () => {
      vi.stubEnv('B2B_CERT', EXISTING_FILE);
      vi.stubEnv('B2B_CERT_FORMAT', 'pem');
      vi.stubEnv('B2B_CERT_KEY', EXISTING_FILE);
      expect(fromEnv).not.toThrow();

      const security = fromEnv();

      expect(security).toEqual(
        expect.objectContaining({
          cert: expect.any(Buffer),
          key: expect.any(Buffer),
        }),
      );
    });
  });
});
