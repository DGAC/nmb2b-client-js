import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { clearCache, fromEnv } from './security.ts';

const usedEnvKeys = [
  'B2B_CERT',
  'B2B_CERT_FORMAT',
  'B2B_CERT_PASSPHRASE',
  'B2B_CERT_KEY',
  'B2B_API_KEY_ID',
  'B2B_API_SECRET_KEY',
];

describe('fromEnv', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    usedEnvKeys.forEach((k) => delete process.env[k]);
  });

  afterEach(() => {
    process.env = OLD_ENV;
    clearCache();
  });

  test('without env variables', () => {
    expect(fromEnv).toThrow(/B2B_CERT/);
  });

  test('with a cert file that does not exist', () => {
    process.env.B2B_CERT = 'non-existent-file';
    expect(fromEnv).toThrow(/non-existent-file/);
  });

  test('with a cert file that exists', () => {
    process.env.B2B_CERT = __filename;
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
    process.env.B2B_CERT = __filename;
    process.env.B2B_CERT_FORMAT = 'non-existent-format';
    expect(fromEnv).toThrow(/B2B_CERT_FORMAT/);
  });

  describe('PEM format', () => {
    test('without a key file', () => {
      process.env.B2B_CERT = __filename;
      process.env.B2B_CERT_FORMAT = 'pem';
      expect(fromEnv).toThrow(/B2B_CERT_KEY/);
    });

    test('with a non existent key file', () => {
      process.env.B2B_CERT = __filename;
      process.env.B2B_CERT_FORMAT = 'pem';
      process.env.B2B_CERT_KEY = 'non-existent-file';
      expect(fromEnv).toThrow(/B2B_CERT_KEY/);
    });

    test('with a proper key file', () => {
      process.env.B2B_CERT = __filename;
      process.env.B2B_CERT_FORMAT = 'pem';
      process.env.B2B_CERT_KEY = __filename;
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
