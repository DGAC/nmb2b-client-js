import invariant from 'invariant';
import d from './utils/debug';
const debug = d('security');
import { Config } from './config';
import soap, { ISecurity } from 'soap';
import fs from 'fs';

// tslint:disable-next-line
require('tls').DEFAULT_ECDH_CURVE = 'auto';

interface PfxSecurity {
  pfx: Buffer;
  passphrase: string;
}

interface PemSecurity {
  cert: Buffer;
  key: Buffer;
  passphrase?: string;
}

export type Security = PfxSecurity | PemSecurity;

export function isValidSecurity(obj: Security): boolean {
  invariant(
    ('pfx' in obj && Buffer.isBuffer(obj.pfx)) ||
      ('cert' in obj && Buffer.isBuffer(obj.cert)),
    'security.pfx or security.cert must be buffers',
  );

  if ('cert' in obj && obj.cert) {
    invariant(
      obj.key && Buffer.isBuffer(obj.key),
      'security.key must be a buffer if security.pem is defined',
    );
  }

  return true;
}

export function prepareSecurity(config: Config): ISecurity {
  const { security } = config;
  if ('pfx' in security) {
    const { pfx, passphrase } = security;
    debug('Using PFX certificates');
    return new soap.ClientSSLSecurityPFX(pfx, passphrase);
  } else {
    debug('Using PEM certificates');
    const { key, cert, passphrase } = security;
    return new soap.ClientSSLSecurity(
      key,
      cert,
      undefined,
      !!passphrase ? { passphrase } : null,
    );
  }
}

let envSecurity: Security | undefined;

export function fromEnv(): Security {
  if (envSecurity) {
    return envSecurity;
  }

  const { B2B_CERT } = process.env;

  if (!B2B_CERT) {
    throw new Error('Please define a B2B_CERT environment variable');
  }

  if (!fs.existsSync(B2B_CERT)) {
    throw new Error(`${B2B_CERT} is not a valid certificate file`);
  }

  const pfxOrPem = fs.readFileSync(B2B_CERT);

  if (!process.env.B2B_CERT_FORMAT || process.env.B2B_CERT_FORMAT === 'pfx') {
    envSecurity = {
      pfx: pfxOrPem,
      passphrase: process.env.B2B_CERT_PASSPHRASE || '',
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
