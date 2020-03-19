import path from 'path';
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
    jest.resetModules();
    process.env = { ...OLD_ENV };
    usedEnvKeys.forEach(k => delete process.env[k]);
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  test('without env variables', () => {
    const { fromEnv } = require('./security');
    expect(fromEnv).toThrow(/B2B_CERT/);
  });

  test('with a cert file that does not exist', () => {
    process.env.B2B_CERT = 'non-existent-file';
    const { fromEnv } = require('./security');
    expect(fromEnv).toThrow(/non-existent-file/);
  });

  test('with a cert file that exists', () => {
    process.env.B2B_CERT = __filename;
    const { fromEnv } = require('./security');
    expect(fromEnv).not.toThrow();

    const security = fromEnv();
    expect(security.pfx).toBeDefined();
    expect(security.passphrase).toBeDefined();
  });

  test('should reject unknown format', () => {
    process.env.B2B_CERT = __filename;
    process.env.B2B_CERT_FORMAT = 'non-existent-format';
    const { fromEnv } = require('./security');
    expect(fromEnv).toThrow(/B2B_CERT_FORMAT/);
  });

  describe('PEM format', () => {
    test('without a key file', () => {
      process.env.B2B_CERT = __filename;
      process.env.B2B_CERT_FORMAT = 'pem';
      const { fromEnv } = require('./security');
      expect(fromEnv).toThrow(/B2B_CERT_KEY/);
    });

    test('with a non existent key file', () => {
      process.env.B2B_CERT = __filename;
      process.env.B2B_CERT_FORMAT = 'pem';
      process.env.B2B_CERT_KEY = 'non-existent-file';
      const { fromEnv } = require('./security');
      expect(fromEnv).toThrow(/B2B_CERT_KEY/);
    });

    test('with a proper key file', () => {
      process.env.B2B_CERT = __filename;
      process.env.B2B_CERT_FORMAT = 'pem';
      process.env.B2B_CERT_KEY = __filename;
      const { fromEnv } = require('./security');
      expect(fromEnv).not.toThrow();

      const security = fromEnv();
      expect(security.cert).toBeDefined();
      expect(security.key).toBeDefined();
    });
  });
});
