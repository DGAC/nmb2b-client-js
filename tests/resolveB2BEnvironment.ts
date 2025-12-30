import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadEnvFile } from 'node:process';

/**
 * Resolves all B2B environment variables by applying necessary defaults.
 */
export function resolveB2BEnvironment() {
  const projectRoot = path.join(import.meta.dirname, '..');
  const envPath = path.join(projectRoot, '.env');

  if (existsSync(envPath)) {
    loadEnvFile(envPath);
  }

  const B2B_FLAVOUR = process.env.B2B_FLAVOUR ?? 'OPS';
  if (B2B_FLAVOUR !== 'OPS' && B2B_FLAVOUR !== 'PREOPS') {
    throw new Error(
      `Invalid B2B_FLAVOUR: "${B2B_FLAVOUR}". Must be OPS or PREOPS.`,
    );
  }

  const B2B_XSD_PATH =
    process.env.B2B_XSD_PATH ?? path.join(projectRoot, 'b2b-xsd');

  return {
    // Mode and Paths
    B2B_FLAVOUR,
    B2B_XSD_PATH,

    // Network Configuration
    B2B_ENDPOINT: process.env.B2B_ENDPOINT,
    B2B_XSD_REMOTE_URL: process.env.B2B_XSD_REMOTE_URL,

    // Authentication (Certificates)
    B2B_CERT: process.env.B2B_CERT,
    B2B_CERT_KEY: process.env.B2B_CERT_KEY,
    B2B_CERT_PASSPHRASE: process.env.B2B_CERT_PASSPHRASE,
    B2B_CERT_FORMAT: process.env.B2B_CERT_FORMAT,

    // Authentication (API Gateway)
    B2B_API_KEY_ID: process.env.B2B_API_KEY_ID,
    B2B_API_SECRET_KEY: process.env.B2B_API_SECRET_KEY,
  } as const;
}
