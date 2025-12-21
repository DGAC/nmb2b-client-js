import axios from 'axios';
import { extract } from 'tar';
import { getFileUrl } from '../../config.ts';
import type { B2BFlavour } from '../../constants.ts';
import type { Security } from '../../security.ts';
import d from '../debug.ts';
import { createAxiosConfig } from './createAxiosConfig.ts';
import type { Readable } from 'stream';
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
