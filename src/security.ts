import { assert } from './utils/assert.js';
import d from './utils/debug.js';
const debug = d('security');
import type { Config } from './config.js';
import type { ISecurity } from 'soap';
import {
  ClientSSLSecurity,
  ClientSSLSecurityPFX,
  BasicAuthSecurity,
} from 'soap';
import fs from 'node:fs';

interface PfxSecurity {
  pfx: Buffer;
  passphrase: string;
}

interface PemSecurity {
  cert: Buffer;
  key: Buffer;
  passphrase?: string;
}

interface ApiGwSecurity {
  apiKeyId: string;
  apiSecretKey: string;
}

export type Security = PfxSecurity | PemSecurity | ApiGwSecurity;

export function isValidSecurity(obj: unknown): obj is Security {
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

    return true;
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

  return true;
}

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
