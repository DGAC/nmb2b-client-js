import axios, { AxiosHeaders } from 'axios';
import { extract } from 'tar';
import type { Security } from '../../security.js';
import { createDebugLogger } from '../debug.js';
import { createAxiosConfig } from './createAxiosConfig.js';
import type { Readable } from 'stream';
import { assert } from '../assert.js';
const debug = createDebugLogger('wsdl-downloader');

export async function downloadAndExtractWSDL(
  url: string,
  {
    security,
    outputDir,
  }: {
    security?: Security;
    outputDir: string;
  },
): Promise<void> {
  const options = createAxiosConfig({ security });

  debug(`Downloading ${url}`);
  try {
    const res = await axios.get<Readable>(url, {
      timeout: 15 * 1000,
      responseType: 'stream',
      ...options,
    });

    assert(
      res.headers instanceof AxiosHeaders,
      'Axios response.headers is not an instance of AxiosHeaders class.',
    );

    const contentType = res.headers.get('content-type');

    if (
      contentType &&
      typeof contentType === 'string' &&
      /**
       * Check for valid binary formats to avoid parsing HTML/Text errors as TAR.
       * - gzip: Standard for .tar.gz
       * - octet-stream: Generic binary (common in proxies)
       * - x-tar: Uncompressed tar fallback
       */
      !contentType.includes('gzip') &&
      !contentType.includes('octet-stream') &&
      !contentType.includes('x-tar')
    ) {
      throw new Error(`Invalid Content-Type: ${contentType}`);
    }

    await new Promise<void>((resolve, reject) => {
      res.data
        .pipe(extract({ cwd: outputDir, strip: 1 }))
        .on('error', reject)
        .on('close', () => {
          debug('Downloaded and extracted WSDL files');
          resolve();
        });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Unable to download WSDL: ${message}`, { cause: err });
  }
}
