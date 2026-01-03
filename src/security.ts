import { assert } from './utils/assert.js';
import { createDebugLogger } from './utils/debug.js';
const debug = createDebugLogger('security');
import type { Config } from './config.js';
import type { ISecurity } from 'soap';
import {
  ClientSSLSecurity,
  ClientSSLSecurityPFX,
  BasicAuthSecurity,
} from 'soap';
import fs from 'node:fs';

/**
 * Security configuration using a PFX / PKCS #12 certificate.
 * Used to authenticate with the B2B services using a client certificate.
 */
interface PfxSecurity {
  /**
   * The content of the PFX / PKCS #12 file.
   */
  pfx: Buffer;

  /**
   * The passphrase for the PFX / PKCS #12 container.
   */
  passphrase: string;
}

/**
 * Security configuration using PEM certificate and key.
 * Used to authenticate with the B2B services using a client certificate.
 */
interface PemSecurity {
  /**
   * The content of the PEM certificate file.
   */
  cert: Buffer;

  /**
   * The content of the PEM key file.
   */
  key: Buffer;

  /**
   * The passphrase for the PEM key.
   * Can be omitted if the key is not encrypted.
   */
  passphrase?: string;
}

/**
 * Security configuration using API Gateway credentials.
 * Used to authenticate with the B2B services using an API Key ID and Secret Key.
 * These credentials will be sent as Basic Authentication headers.
 */
interface ApiGwSecurity {
  /**
   * The API Key ID (used as username for Basic Auth).
   */
  apiKeyId: string;

  /**
   * The API Secret Key (used as password for Basic Auth).
   */
  apiSecretKey: string;
}

/**
 * Supported authentication methods.
 * Used in the `Config` object to specify how the client should authenticate with the B2B services.
 */
export type Security = PfxSecurity | PemSecurity | ApiGwSecurity;

/**
 * Asserts that the provided object is a valid {@link Security} configuration.
 * Checks for the presence and validity of required fields for each security type.
 *
 * @param obj - The object to validate.
 * @throws {AssertionError} If the object is not a valid `Security` configuration.
 */
export function assertValidSecurity(obj: unknown): asserts obj is Security {
  assert(!!obj && typeof obj === 'object', 'Must be an object');

  if ('apiKeyId' in obj) {
    assert(
      !!obj.apiKeyId &&
        typeof obj.apiKeyId === 'string' &&
        obj.apiKeyId.length > 0,
      'security.apiKeyId must be a string with a length > 0',
    );

    assert(
      'apiSecretKey' in obj &&
        typeof obj.apiSecretKey === 'string' &&
        obj.apiSecretKey.length > 0,
      'security.apiSecretKey must be defined when using security.apiKeyId',
    );

    return;
  }

  assert(
    ('pfx' in obj && Buffer.isBuffer(obj.pfx)) ||
      ('cert' in obj && Buffer.isBuffer(obj.cert)),
    'security.pfx or security.cert must be buffers',
  );

  if ('cert' in obj && obj.cert) {
    assert(
      'key' in obj && obj.key && Buffer.isBuffer(obj.key),
      'security.key must be a buffer if security.pem is defined',
    );
  }
}

/**
 * @deprecated Use {@link assertValidSecurity} instead.
 */
export function isValidSecurity(obj: unknown): obj is Security {
  assertValidSecurity(obj);
  return true;
}

/**
 * @internal
 */
export function prepareSecurity(config: Config): ISecurity {
  const { security } = config;

  if ('apiKeyId' in security) {
    const { apiKeyId, apiSecretKey } = security;
    debug('Using ApiGateway security');
    return new BasicAuthSecurity(apiKeyId, apiSecretKey);
  } else if ('pfx' in security) {
    const { pfx, passphrase } = security;
    debug('Using PFX certificates');
    return new ClientSSLSecurityPFX(pfx, passphrase);
  } else if ('cert' in security) {
    debug('Using PEM certificates');
    const { key, cert, passphrase } = security;
    return new ClientSSLSecurity(
      key,
      cert,
      undefined,
      passphrase ? { passphrase } : null,
    );
  }

  throw new Error('Invalid security object');
}

let envSecurity: Security | undefined;

/**
 * Create a security objet from environment variables
 *
 * Will cache data for future use.
 *
 * @returns Security configuration
 */
export function fromEnv(): Security {
  if (envSecurity) {
    return envSecurity;
  }

  envSecurity = fromValues(process.env);

  return envSecurity;
}

/**
 * Convenience function to clear the cached security objet
 */
export function clearCache(): void {
  envSecurity = undefined;
}

/**
 * Create a security objet from an environment-like object
 *
 * @param env Environment variables
 * @returns Security configuration
 */
export function fromValues(env: Record<string, string | undefined>): Security {
  const { B2B_CERT, B2B_API_KEY_ID, B2B_API_SECRET_KEY } = env;

  if (!B2B_CERT && !B2B_API_KEY_ID) {
    throw new Error(
      'Please define a B2B_CERT or a B2B_API_KEY_ID environment variable',
    );
  }

  if (B2B_API_KEY_ID) {
    if (!B2B_API_SECRET_KEY) {
      throw new Error(
        `When using B2B_API_KEY_ID, a B2B_API_SECRET_KEY must be defined`,
      );
    }

    return {
      apiKeyId: B2B_API_KEY_ID,
      apiSecretKey: B2B_API_SECRET_KEY,
    };
  }

  if (!B2B_CERT) {
    throw new Error('Should never happen');
  }

  if (!fs.existsSync(B2B_CERT)) {
    throw new Error(`${B2B_CERT} is not a valid certificate file`);
  }

  const pfxOrPem = fs.readFileSync(B2B_CERT);

  if (!env.B2B_CERT_FORMAT || env.B2B_CERT_FORMAT === 'pfx') {
    return {
      pfx: pfxOrPem,
      passphrase: env.B2B_CERT_PASSPHRASE ?? '',
    };
  } else if (env.B2B_CERT_FORMAT === 'pem') {
    if (!env.B2B_CERT_KEY || !fs.existsSync(env.B2B_CERT_KEY)) {
      throw new Error(
        'Please define a valid B2B_CERT_KEY environment variable',
      );
    }

    const security: PemSecurity = {
      cert: pfxOrPem,
      key: fs.readFileSync(env.B2B_CERT_KEY),
    };

    if (env.B2B_CERT_PASSPHRASE) {
      security.passphrase = env.B2B_CERT_PASSPHRASE;
    }

    return security;
  }

  throw new Error('Unsupported B2B_CERT_FORMAT, must be pfx or pem');
}
