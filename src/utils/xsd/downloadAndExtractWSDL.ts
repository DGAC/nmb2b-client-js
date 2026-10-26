import axios, { AxiosHeaders } from 'axios';
import { extract } from 'tar';
import type { Security } from '../../security.ts';
import { createDebugLogger } from '../debug.ts';
import { createAxiosConfig } from './createAxiosConfig.ts';
import type { Readable } from 'node:stream';
import { text } from 'node:stream/consumers';
import { assert } from '../assert.ts';
import { NMB2BTransportError } from '../NMB2BTransportError.ts';
import { sanitizeError } from '../sanitizeError.ts';
import { stripUrlCredentials } from '../stripUrlCredentials.ts';
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

  debug(`Downloading ${stripUrlCredentials(url)}`);

  const messagePrefix = 'Unable to download WSDL: ';

  const res = await axios
    .get<Readable>(url, {
      timeout: 15 * 1000,
      responseType: 'stream',
      // Error statuses resolve, to be handled below: the body is a stream, which
      // only `res` lets us read. The `.catch` sees failures without a response.
      validateStatus: null,
      ...options,
    })
    .catch((err: unknown) => {
      throw sanitizeError(err, { url, messagePrefix });
    });

  assert(
    res.headers instanceof AxiosHeaders,
    'Axios response.headers is not an instance of AxiosHeaders class.',
  );

  const contentType = res.headers.get('content-type');

  const invalidContentType =
    !!contentType &&
    typeof contentType === 'string' &&
    /**
     * Check for valid binary formats to avoid parsing HTML/Text errors as TAR.
     * - gzip: Standard for .tar.gz
     * - octet-stream: Generic binary (common in proxies)
     * - x-tar: Uncompressed tar fallback
     */
    !contentType.includes('gzip') &&
    !contentType.includes('octet-stream') &&
    !contentType.includes('x-tar');

  if (res.status >= 400 || invalidContentType) {
    const body = await text(res.data).catch((err: unknown) => {
      throw sanitizeError(err, { kind: 'network', url, messagePrefix });
    });

    const message =
      res.status >= 400
        ? `HTTP status ${res.status}`
        : `Invalid Content-Type: ${String(contentType)}`;

    throw new NMB2BTransportError({
      kind: res.status >= 400 ? 'http' : 'parse',
      message: `${messagePrefix}${message}`,
      httpStatus: res.status,
      url,
      body,
    });
  }

  await new Promise<void>((resolve, reject) => {
    // `pipe()` does not forward the source's errors: a connection lost while
    // reading the archive is caught here.
    res.data.on('error', (err) => {
      reject(sanitizeError(err, { kind: 'network', url, messagePrefix }));
    });

    res.data
      .pipe(extract({ cwd: outputDir, strip: 1 }))
      .on('error', (err) => {
        reject(sanitizeError(err, { kind: 'parse', url, messagePrefix }));
      })
      .on('close', () => {
        debug('Downloaded and extracted WSDL files');
        resolve();
      });
  });
}
