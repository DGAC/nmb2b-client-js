import { execFileSync } from 'node:child_process';
import { createPrivateKey } from 'node:crypto';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  CERTIFICATE_SUBJECT,
  CREDENTIAL_FIXTURES,
  PEM_PASSPHRASE,
  PFX_PASSPHRASE,
} from '../tests/fixtures/credentials/constants.ts';

/**
 * Writes the throwaway certificate, key and PFX the unit tests use for
 * certificate security (`tests/fixtures/credentials/`).
 *
 * Node can neither create a certificate nor write a PKCS#12 file: this script
 * needs the `openssl` CLI, the tests do not.
 */
const dir = mkdtempSync(path.join(os.tmpdir(), 'b2b-client-credential-fixtures-'));

try {
  const keyPath = path.join(dir, 'key.pem');
  const certPath = path.join(dir, 'cert.pem');

  // OpenSSL gets its passphrase from the environment, never from argv.
  const openssl = (args: Array<string>) =>
    execFileSync('openssl', args, {
      env: { ...process.env, PFX_PASSPHRASE },
      stdio: 'pipe',
    });

  // Node checks neither the validity period nor the issuer of a client
  // certificate before sending a request: 100 years spares regenerating it.
  openssl([
    /* oxlint-disable unicorn/no-useless-spread -- openssl arguments grouped by option */
    ...['req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:P-256', '-noenc'],
    ...['-subj', CERTIFICATE_SUBJECT, '-days', '36500'],
    ...['-keyout', keyPath, '-out', certPath],
    /* oxlint-enable unicorn/no-useless-spread */
  ]);

  const pfx = openssl([
    /* oxlint-disable unicorn/no-useless-spread -- openssl arguments grouped by option */
    ...['pkcs12', '-export', '-inkey', keyPath, '-in', certPath],
    ...['-passout', 'env:PFX_PASSPHRASE'],
    /* oxlint-enable unicorn/no-useless-spread */
  ]);

  const key = createPrivateKey(readFileSync(keyPath)).export({
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: PEM_PASSPHRASE,
  });

  copyFileSync(certPath, CREDENTIAL_FIXTURES.cert);
  writeFileSync(CREDENTIAL_FIXTURES.key, key);
  writeFileSync(CREDENTIAL_FIXTURES.pfx, pfx);

  console.log(`Wrote credential fixtures to ${path.dirname(CREDENTIAL_FIXTURES.cert)}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
