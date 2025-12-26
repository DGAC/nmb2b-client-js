import { readdir } from 'node:fs/promises';
import lockfile from 'proper-lockfile';
import type { Config } from '../../config.js';
import d from '../debug.js';
import { createDir, dirExists } from '../fs.js';
import { downloadAndExtractWSDL } from './downloadAndExtractWSDL.js';
import { getWSDLDownloadURL } from './getWSDLDownloadURL.js';
import { getXSDCacheDirectory } from './paths.js';

const debug = d('wsdl');

export async function WSDLExists(
  config: Pick<Config, 'XSD_PATH' | 'xsdEndpoint'>,
): Promise<boolean> {
  const directory = getXSDCacheDirectory(config);

  debug(`Checking if directory ${directory} exists`);

  if (!(await dirExists(directory))) {
    return false;
  }

  const files = await readdir(directory);
  return files.length > 0;
}

export async function download(config: Config): Promise<void> {
  const outputDir = getXSDCacheDirectory(config);

  if (!(await dirExists(outputDir))) {
    debug(`Creating directory ${outputDir}`);
    await createDir(outputDir);
  }

  debug(`Acquiring lock for folder ${outputDir}`);
  const releaseLock = await lockfile.lock(outputDir, {
    retries: 5,
  });

  try {
    debug(`Lock acquired. Testing WSDL existence ...`);

    const hasWSDL = await WSDLExists(config);

    if (!config.ignoreWSDLCache && hasWSDL) {
      debug('WSDL found');
      return;
    }

    const url = await getWSDLDownloadURL(config);

    debug(`Downloading ${url}`);

    await downloadAndExtractWSDL(url, {
      security: config.security,
      outputDir,
    });
  } finally {
    await releaseLock();
  }
}
