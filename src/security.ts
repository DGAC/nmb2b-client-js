import invariant from 'invariant';
import d from './utils/debug';
const debug = d('security');
import type { Config } from './config';
import type { ISecurity } from 'soap';
import {
  ClientSSLSecurity,
  ClientSSLSecurityPFX,
  BasicAuthSecurity,
} from 'soap';
import fs from 'fs';

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
  invariant(!!obj && typeof obj === 'object', 'Must be an object');

  if ('apiKeyId' in obj) {
    invariant(
      !!obj.apiKeyId &&
        typeof obj.apiKeyId === 'string' &&
        obj.apiKeyId.length > 0,
      'security.apiKeyId must be a string with a length > 0',
    );

    invariant(
      'apiSecretKey' in obj &&
        typeof obj.apiSecretKey === 'string' &&
        obj.apiSecretKey.length > 0,
      'security.apiSecretKey must be defined when using security.apiKeyId',
    );

    return true;
  }

  invariant(
    ('pfx' in obj && Buffer.isBuffer(obj.pfx)) ||
      ('cert' in obj && Buffer.isBuffer(obj.cert)),
    'security.pfx or security.cert must be buffers',
  );

  if ('cert' in obj && obj.cert) {
    invariant(
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

  const { B2B_CERT, B2B_API_KEY_ID, B2B_API_SECRET_KEY } = process.env;

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

  if (!process.env.B2B_CERT_FORMAT || process.env.B2B_CERT_FORMAT === 'pfx') {
    envSecurity = {
      pfx: pfxOrPem,
      passphrase: process.env.B2B_CERT_PASSPHRASE ?? '',
    };

    return envSecurity;
  } else if (process.env.B2B_CERT_FORMAT === 'pem') {
    if (!process.env.B2B_CERT_KEY || !fs.existsSync(process.env.B2B_CERT_KEY)) {
      throw new Error(
        'Please define a valid B2B_CERT_KEY environment variable',
      );
    }

    envSecurity = {
      cert: pfxOrPem,
      key: fs.readFileSync(process.env.B2B_CERT_KEY),
    };

    if (process.env.B2B_CERT_PASSPHRASE) {
      envSecurity = {
        ...envSecurity,
        passphrase: process.env.B2B_CERT_PASSPHRASE,
      };
      return envSecurity;
    }

    return envSecurity;
  }

  throw new Error('Unsupported B2B_CERT_FORMAT, must be pfx or pem');
}

/**
 * Convenience function to clear the cached security objet
 */
export function clearCache(): void {
  envSecurity = undefined;
}
