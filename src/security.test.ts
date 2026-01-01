import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  assertValidSecurity,
  isValidSecurity,
  clearCache,
  fromEnv,
  fromValues,
} from './security.js';

const usedEnvKeys = [
  'B2B_CERT',
  'B2B_CERT_FORMAT',
  'B2B_CERT_PASSPHRASE',
  'B2B_CERT_KEY',
  'B2B_API_KEY_ID',
  'B2B_API_SECRET_KEY',
];

const EXISTING_FILE = import.meta.filename;

describe(assertValidSecurity, () => {
  describe.each([
    [
      'with pfx security',
      {
        pfx: Buffer.from('pfx'),
        passphrase: 'pass',
      },
    ],
    [
      'with pem security',
      {
        cert: Buffer.from('cert'),
        key: Buffer.from('key'),
      },
    ],
    [
      'with api gateway security',
      {
        apiKeyId: 'id',
        apiSecretKey: 'secret',
      },
    ],
  ])('with valid security: %s', (_, security) => {
    test('should not throw', () => {
      expect(() => {
        assertValidSecurity(security);
      }).not.toThrow();
    });
  });

  describe.each([
    [
      'null object',
      {
        security: null,
        errorMessage: /Must be an object/,
      },
    ],
    [
      'string input',
      {
        security: 'invalid',
        errorMessage: /Must be an object/,
      },
    ],
    [
      'empty object',
      {
        security: {},
        errorMessage: /security.pfx or security.cert must be buffers/,
      },
    ],
    [
      'api gateway: empty id',
      {
        security: { apiKeyId: '', apiSecretKey: 'secret' },
        errorMessage: /security.apiKeyId must be a string/,
      },
    ],
    [
      'api gateway: missing secret',
      {
        security: { apiKeyId: 'id' },
        errorMessage: /security.apiSecretKey must be defined/,
      },
    ],
    [
      'api gateway: empty secret',
      {
        security: { apiKeyId: 'id', apiSecretKey: '' },
        errorMessage: /security.apiSecretKey must be defined/,
      },
    ],
    [
      'pfx: not a buffer',
      {
        security: { pfx: 'string' },
        errorMessage: /security.pfx or security.cert must be buffers/,
      },
    ],
    [
      'pem: missing key',
      {
        security: { cert: Buffer.from('cert') },
        errorMessage: /security.key must be a buffer/,
      },
    ],
    [
      'pem: key not a buffer',
      {
        security: { cert: Buffer.from('cert'), key: 'string' },
        errorMessage: /security.key must be a buffer/,
      },
    ],
  ])('with invalid security: %s', (_, { security, errorMessage }) => {
    test('should throw an error', () => {
      expect(() => {
        assertValidSecurity(security);
      }).toThrowError(errorMessage);
    });
  });
});

// eslint-disable-next-line @typescript-eslint/no-deprecated -- Legacy API
describe(isValidSecurity, () => {
  test('should return true for valid security', () => {
    expect(
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- Legacy API
      isValidSecurity({
        apiKeyId: 'id',
        apiSecretKey: 'secret',
      }),
    ).toBe(true);
  });

  test('should throw for invalid security (backward compatibility)', () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Legacy API
    expect(() => isValidSecurity({})).toThrow();
  });
});

describe(fromValues, () => {
  test('should throw if no variables provided', () => {
    expect(() => fromValues({})).toThrow(/Please define a B2B_CERT/);
  });

  describe('API Gateway', () => {
    const VALID_CONFIG = {
      B2B_API_KEY_ID: 'id',
      B2B_API_SECRET_KEY: 'secret',
    };

    test('should return valid config with ID and Secret', () => {
      const result = fromValues(VALID_CONFIG);

      expect(result).toEqual({
        apiKeyId: VALID_CONFIG.B2B_API_KEY_ID,
        apiSecretKey: VALID_CONFIG.B2B_API_SECRET_KEY,
      });

      expect(() => {
        assertValidSecurity(result);
      }).not.toThrow();
    });

    test('should throw if B2B_API_KEY_ID is missing', () => {
      expect(() =>
        fromValues({
          ...VALID_CONFIG,
          B2B_API_SECRET_KEY: undefined,
        }),
      ).toThrow(/B2B_API_SECRET_KEY must be defined/);
    });
  });

  describe('Certificates (PFX)', () => {
    const VALID_PFX_CONFIG = {
      B2B_CERT: EXISTING_FILE,
      B2B_CERT_PASSPHRASE: 'pass',
    };

    test('should throw if file does not exist', () => {
      expect(() =>
        fromValues({
          B2B_CERT: 'non-existent',
        }),
      ).toThrow(/not a valid certificate file/);
    });

    test('should return valid PFX config', () => {
      const result = fromValues(VALID_PFX_CONFIG);

      expect(result).toEqual(
        expect.objectContaining({
          pfx: expect.any(Buffer),
          passphrase: 'pass',
        }),
      );

      expect(() => {
        assertValidSecurity(result);
      }).not.toThrow();
    });

    test('should throw on unknown format', () => {
      expect(() =>
        fromValues({
          ...VALID_PFX_CONFIG,
          B2B_CERT_FORMAT: 'unknown',
        }),
      ).toThrow(/Unsupported B2B_CERT_FORMAT/);
    });
  });

  describe('Certificates (PEM)', () => {
    const VALID_PEM_CONFIG = {
      B2B_CERT: EXISTING_FILE,
      B2B_CERT_FORMAT: 'pem',
      B2B_CERT_KEY: EXISTING_FILE,
    };

    test('should throw if key is missing', () => {
      expect(() =>
        fromValues({
          ...VALID_PEM_CONFIG,
          B2B_CERT_KEY: undefined,
        }),
      ).toThrow(/define a valid B2B_CERT_KEY/);
    });

    test('should throw if key file does not exist', () => {
      expect(() =>
        fromValues({
          ...VALID_PEM_CONFIG,
          B2B_CERT_KEY: 'non-existent',
        }),
      ).toThrow(/define a valid B2B_CERT_KEY/);
    });

    test('should return valid PEM config', () => {
      const result = fromValues(VALID_PEM_CONFIG);

      expect(result).toEqual(
        expect.objectContaining({
          cert: expect.any(Buffer),
          key: expect.any(Buffer),
        }),
      );
      expect(() => {
        assertValidSecurity(result);
      }).not.toThrow();
    });
  });
});

describe(fromEnv, () => {
  const ENV_PFX_CONFIG = {
    B2B_CERT: EXISTING_FILE,
    B2B_CERT_PASSPHRASE: 'env-pass',
  };

  beforeEach(() => {
    for (const envKey of usedEnvKeys) {
      vi.stubEnv(envKey, undefined);
    }

    return () => {
      vi.unstubAllEnvs();
      clearCache();
    };
  });

  test('should read from process.env', () => {
    vi.stubEnv('B2B_CERT', ENV_PFX_CONFIG.B2B_CERT);
    vi.stubEnv('B2B_CERT_PASSPHRASE', ENV_PFX_CONFIG.B2B_CERT_PASSPHRASE);

    const result = fromEnv();

    expect(result).toEqual(
      expect.objectContaining({
        pfx: expect.any(Buffer),
        passphrase: ENV_PFX_CONFIG.B2B_CERT_PASSPHRASE,
      }),
    );

    expect(() => {
      assertValidSecurity(result);
    }).not.toThrow();
  });

  test('should cache the result', () => {
    vi.stubEnv('B2B_CERT', ENV_PFX_CONFIG.B2B_CERT);
    vi.stubEnv('B2B_CERT_PASSPHRASE', ENV_PFX_CONFIG.B2B_CERT_PASSPHRASE);

    const first = fromEnv();

    // Change env, result should remain the same object reference
    vi.stubEnv('B2B_CERT_PASSPHRASE', 'changed');
    const second = fromEnv();

    expect(second).toBe(first);
    expect(second).toEqual(
      expect.objectContaining({
        pfx: expect.any(Buffer),
        passphrase: ENV_PFX_CONFIG.B2B_CERT_PASSPHRASE,
      }),
    );
  });

  test('should clear cache', () => {
    vi.stubEnv('B2B_CERT', ENV_PFX_CONFIG.B2B_CERT);
    vi.stubEnv('B2B_CERT_PASSPHRASE', 'initial');
    fromEnv();

    clearCache();

    vi.stubEnv('B2B_CERT_PASSPHRASE', ENV_PFX_CONFIG.B2B_CERT_PASSPHRASE);
    const result = fromEnv();

    expect(result).toEqual(
      expect.objectContaining({
        pfx: expect.any(Buffer),
        passphrase: ENV_PFX_CONFIG.B2B_CERT_PASSPHRASE,
      }),
    );

    expect(() => {
      assertValidSecurity(result);
    }).not.toThrow();
  });
});
