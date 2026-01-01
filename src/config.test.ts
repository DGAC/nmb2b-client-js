import { fromPartial } from '@total-typescript/shoehorn';
import {
  assertValidConfig,
  getEndpoint,
  getFileEndpoint,
  getFileUrl,
  getSoapEndpoint,
  isConfigValid,
  obfuscate,
} from './config.js';

import { describe, expect, test } from 'vitest';

const VALID_SECURITY_MOCK = {
  apiKeyId: 'valid-id',
  apiSecretKey: 'valid-secret',
};

const VALID_BASE_CONFIG = {
  flavour: 'OPS',
  security: VALID_SECURITY_MOCK,
  endpoint: 'https://valid.endpoint',
  xsdEndpoint: 'https://valid.xsd',
  XSD_PATH: '/tmp',
  hooks: [],
};

const CONFIG_WITH_API_KEY = {
  flavour: 'OPS',
  security: { apiKeyId: 'id', apiSecretKey: 'secret' },
};

describe(assertValidConfig, () => {
  describe.each([
    ['valid OPS config', VALID_BASE_CONFIG],
    ['valid PREOPS config', { ...VALID_BASE_CONFIG, flavour: 'PREOPS' }],
    [
      'valid API Key security + endpoints',
      {
        ...VALID_BASE_CONFIG,
        security: { apiKeyId: 'id', apiSecretKey: 'secret' },
        endpoint: 'https://example.com',
        xsdEndpoint: 'https://example.com',
      },
    ],
  ])('with %s', (_, config) => {
    test('should not throw', () => {
      expect(() => {
        assertValidConfig(config);
      }).not.toThrow();
    });
  });

  describe.each([
    [
      'null config',
      {
        config: null,
        errorMessage: /Invalid config/,
      },
    ],
    [
      'empty object',
      {
        config: {},
        errorMessage: /Please provide a valid security option/,
      },
    ],
    [
      'missing security',
      {
        config: { flavour: 'OPS' },
        errorMessage: /Please provide a valid security option/,
      },
    ],
    [
      'invalid security (delegation check)',
      {
        config: { ...VALID_BASE_CONFIG, security: {} },
        errorMessage: /security.pfx or security.cert must be buffers/,
      },
    ],
    [
      'missing flavour',
      {
        config: { security: VALID_SECURITY_MOCK },
        errorMessage: /Invalid config.flavour/,
      },
    ],
    [
      'invalid flavour',
      {
        config: { ...VALID_BASE_CONFIG, flavour: 'INVALID' },
        errorMessage: /Invalid config.flavour/,
      },
    ],
    [
      'API Key security without endpoint',
      {
        config: {
          ...CONFIG_WITH_API_KEY,
          xsdEndpoint: 'https://valid',
        },
        errorMessage: /config.endpoint must be defined/,
      },
    ],
    [
      'API Key security without xsdEndpoint',
      {
        config: {
          ...CONFIG_WITH_API_KEY,
          endpoint: 'https://valid',
        },
        errorMessage: /config.xsdEndpoint must be defined/,
      },
    ],
  ])('with %s', (_, { config, errorMessage }) => {
    test('should throw error', () => {
      expect(() => {
        assertValidConfig(config);
      }).toThrowError(errorMessage);
    });
  });
});

describe(getSoapEndpoint, () => {
  describe('without config.endpoint override', () => {
    test('should default to OPS when no config is provided', () => {
      expect(getSoapEndpoint()).toBe(
        'https://www.b2b.nm.eurocontrol.int/B2B_OPS/gateway/spec/27.0.0',
      );
    });

    test('should return OPS URL for explicit OPS flavour', () => {
      expect(getSoapEndpoint({ flavour: 'OPS' })).toBe(
        'https://www.b2b.nm.eurocontrol.int/B2B_OPS/gateway/spec/27.0.0',
      );
    });

    test('should return PREOPS URL for PREOPS flavour', () => {
      expect(getSoapEndpoint({ flavour: 'PREOPS' })).toBe(
        'https://www.b2b.preops.nm.eurocontrol.int/B2B_PREOPS/gateway/spec/27.0.0',
      );
    });
  });

  describe('with config.endpoint override', () => {
    test('should use custom endpoint with default OPS flavour', () => {
      expect(getSoapEndpoint({ endpoint: 'https://custom.com' })).toBe(
        'https://custom.com/B2B_OPS/gateway/spec/27.0.0',
      );
    });

    test('should use custom endpoint with PREOPS flavour', () => {
      expect(
        getSoapEndpoint({ endpoint: 'https://custom.com', flavour: 'PREOPS' }),
      ).toBe('https://custom.com/B2B_PREOPS/gateway/spec/27.0.0');
    });

    test('should handle trailing slash in custom endpoint', () => {
      expect(getSoapEndpoint({ endpoint: 'https://custom.com/' })).toBe(
        'https://custom.com/B2B_OPS/gateway/spec/27.0.0',
      );
    });
  });
});

// eslint-disable-next-line @typescript-eslint/no-deprecated -- Legacy API
describe(isConfigValid, () => {
  test('should return true for valid config', () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Legacy API
    expect(isConfigValid(VALID_BASE_CONFIG)).toBe(true);
  });

  test('should throw for invalid config (backward compatibility)', () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Legacy API
    expect(() => isConfigValid({})).toThrow();
  });
});

// eslint-disable-next-line @typescript-eslint/no-deprecated -- Legacy API
describe(getEndpoint, () => {
  test('should be an alias to getSoapEndpoint', () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Legacy API
    expect(getEndpoint()).toBe(getSoapEndpoint());
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Legacy API
    expect(getEndpoint({ flavour: 'PREOPS' })).toBe(
      getSoapEndpoint({ flavour: 'PREOPS' }),
    );
  });
});

// eslint-disable-next-line @typescript-eslint/no-deprecated -- Legacy API
describe(getFileEndpoint, () => {
  test('without flavour', () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Legacy API
    expect(getFileEndpoint()).toBe(
      'https://www.b2b.nm.eurocontrol.int/FILE_OPS/gateway/spec',
    );
  });

  test('with flavour', () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Legacy API
    expect(getFileEndpoint({ flavour: 'OPS' })).toBe(
      'https://www.b2b.nm.eurocontrol.int/FILE_OPS/gateway/spec',
    );
  });
});

describe(getFileUrl, () => {
  test('without flavour', () => {
    expect(getFileUrl('bla')).toBe(
      'https://www.b2b.nm.eurocontrol.int/FILE_OPS/gateway/spec/bla',
    );
  });

  test('with flavour', () => {
    expect(getFileUrl('bla', { flavour: 'OPS' })).toBe(
      'https://www.b2b.nm.eurocontrol.int/FILE_OPS/gateway/spec/bla',
    );
  });

  test('with PREOPS flavour', () => {
    expect(getFileUrl('bla', { flavour: 'PREOPS' })).toBe(
      'https://www.b2b.preops.nm.eurocontrol.int/FILE_PREOPS/gateway/spec/bla',
    );
  });

  test('with leading slash', () => {
    expect(getFileUrl('/bla')).toBe(
      'https://www.b2b.nm.eurocontrol.int/FILE_OPS/gateway/spec/bla',
    );
  });

  test('with overriden endpoint', () => {
    expect(() =>
      getFileUrl('/bla', { endpoint: 'https://blabla' }),
    ).toThrowError(
      'File download URL is not supported when config.endpoint is overriden',
    );
  });
});

describe(obfuscate, () => {
  test('should obfuscate all security values', () => {
    const obfuscated = obfuscate(
      fromPartial({
        xsdEndpoint: 'foobar',
        security: { apiKeyId: 'bar', apiSecretKey: 'baz' },
      }),
    );

    expect(obfuscated).toEqual({
      xsdEndpoint: 'foobar',
      security: {
        apiKeyId: 'xxxxxxxxxxxxxxxx',
        apiSecretKey: 'xxxxxxxxxxxxxxxx',
      },
    });
  });
});
