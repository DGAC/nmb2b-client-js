import assert from 'node:assert';
import fs from 'node:fs/promises';
import { getXSDCacheDirectory } from '../src/utils/xsd/paths.js';
import { WSDLExists } from '../src/utils/xsd/index.js';
import { resolveB2BEnvironment } from './resolveB2BEnvironment.js';
import { MOCK_B2B_XSD_ENDPOINT } from './constants.js';

export default async function setup() {
  const env = resolveB2BEnvironment();

  const exists = await WSDLExists({
    XSD_PATH: env.B2B_XSD_PATH,
    xsdEndpoint: env.B2B_XSD_REMOTE_URL,
  });

  if (!exists) {
    throw new Error(
      `\n[B2B-CLIENT] CRITICAL ERROR: WSDL/XSD files are missing in:\n` +
        `              ${env.B2B_XSD_PATH}\n\n` +
        `Initialization of SOAP clients will fail. Tests aborted.\n` +
        `Please run 'pnpm downloadWSDL' before launching tests.\n`,
    );
  }

  /**
   * Ensures WSDL file availability for unit tests without triggering network downloads.
   *
   * At this point, we know that we have real WSDL on disk.
   *
   * We need to make those available for the unit tests.
   *
   * Unit tests use a fake 'xsdEndpoint' URL for configuration validation. This script aliases the cache
   * directory that the client naturally derives from this URL to the real location of the files
   * on disk via a symbolic link.
   */
  const sourceDir = getXSDCacheDirectory({
    XSD_PATH: env.B2B_XSD_PATH,
    xsdEndpoint: env.B2B_XSD_REMOTE_URL,
  });

  const targetDir = getXSDCacheDirectory({
    XSD_PATH: env.B2B_XSD_PATH,
    xsdEndpoint: MOCK_B2B_XSD_ENDPOINT,
  });

  assert.notEqual(
    sourceDir,
    targetDir,
    'Mocked B2B XSD endpoint should not point to the real WSDL folder',
  );

  const stats = await fs.lstat(targetDir).catch(() => null);

  if (stats?.isSymbolicLink()) {
    const symlinkSource = await fs.readlink(targetDir);

    assert.equal(
      symlinkSource,
      sourceDir,
      'WSDL symlink exists but points to an invalid folder.',
    );

    /**
     * If a correct symlink already exists, there's no point in cleaning up.
     */
    return;
  }

  await fs.symlink(sourceDir, targetDir, 'dir');

  return async function cleanup() {
    await fs.unlink(targetDir);
  };
}
