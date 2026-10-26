import path from 'node:path';

/**
 * Throwaway test credentials for the certificate security modes, read by the
 * unit tests. They grant access to nothing: the certificate is self-signed and
 * never sent to a real B2B.
 *
 * Regenerate them with `pnpm generate-credential-fixtures` (requires the
 * `openssl` CLI).
 */
export const CREDENTIAL_FIXTURES = {
  /** Self-signed certificate, PEM. */
  cert: path.join(import.meta.dirname, 'cert.pem'),
  /** Private key of `cert`, PKCS#8 PEM encrypted with `PEM_PASSPHRASE`. */
  key: path.join(import.meta.dirname, 'key.pem'),
  /** `cert` and its key, PKCS#12 encrypted with `PFX_PASSPHRASE`. */
  pfx: path.join(import.meta.dirname, 'cert.pfx'),
};

export const CERTIFICATE_SUBJECT = '/CN=nmb2b-client-test';

/**
 * Long and distinct, so that a match in `findCredentialPaths` can only come
 * from the passphrase itself.
 */
export const PFX_PASSPHRASE = 'nmb2b-client-test-pfx-passphrase-4e263879-4617-4c86';
export const PEM_PASSPHRASE = 'nmb2b-client-test-pem-passphrase-8f6d9ae6-9036-4695';
