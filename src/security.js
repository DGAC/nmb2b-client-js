/* @flow */
import invariant from 'invariant';
import d from 'debug';
import type { Config } from './config';
import soap from 'soap';
const debug = d('nm-b2b-client.security');
import fs from 'fs';
import path from 'path';

// $FlowFixMe
require('tls').DEFAULT_ECDH_CURVE = 'auto';

export type Security =
  | {
      pfx: Buffer,
      passphrase: string,
    }
  | {
      cert: Buffer,
      key: Buffer,
      passphrase?: ?string,
    };

export function isValidSecurity(obj: Object): boolean {
  invariant(
    (obj.pfx && Buffer.isBuffer(obj.pfx)) ||
      (obj.cert && Buffer.isBuffer(obj.cert)),
    'security.pfx or security.cert must be buffers',
  );

  if (obj.cert) {
    invariant(
      obj.key && Buffer.isBuffer(obj.key),
      'security.key must be a buffer if security.pem is defined',
    );
  }

  return true;
}

export function prepareSecurity(config: Config): Object {
  const { security } = config;
  if (security.pfx) {
    // $FlowFixMe
    const { pfx, passphrase } = security;
    debug('Using PFX certificates');
    return new soap.ClientSSLSecurityPFX(pfx, passphrase);
  }

  debug('Using PEM certificates');
  const { key, cert, passphrase } = security;
  return new soap.ClientSSLSecurity(
    key,
    cert,
    null,
    !!passphrase ? { passphrase } : null,
  );
}

let envSecurity;

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
      ecdhCurve: 'auto',
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
      ecdhCurve: 'auto',
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
