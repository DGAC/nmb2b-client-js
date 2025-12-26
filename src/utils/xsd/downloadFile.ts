import axios, { AxiosHeaders } from 'axios';
import { extract } from 'tar';
import { getFileUrl } from '../../config.js';
import type { B2BFlavour } from '../../constants.js';
import type { Security } from '../../security.js';
import d from '../debug.js';
import { createAxiosConfig } from './createAxiosConfig.js';
import type { Readable } from 'stream';
import { assert } from '../assert.js';
const debug = d('wsdl-downloader');

export async function downloadFile(
  filePath: string,
  {
    flavour,
    security,
    XSD_PATH: outputDir,
    xsdEndpoint,
  }: {
    flavour: B2BFlavour;
    security?: Security;
    XSD_PATH: string;
    xsdEndpoint?: string;
  },
): Promise<void> {
  const options = createAxiosConfig({ security });

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const url = xsdEndpoint || getFileUrl(filePath, { flavour });

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

    return new Promise((resolve, reject) => {
      res.data
        .pipe(extract({ cwd: outputDir }))
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
