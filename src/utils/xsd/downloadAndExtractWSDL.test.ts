import { randomUUID } from 'node:crypto';
import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';

import { fromPartial } from '@total-typescript/shoehorn';
import { delay, http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, test, assert } from 'vitest';

import { createMockArchive } from '../../../tests/utils.ts';
import {
  createTestSecurities,
  findCredentialPaths,
  URL_PASSWORD,
  withCredentialsInUrl,
} from '../../../tests/utils/credentials.ts';
import { server } from '../../../tests/utils/msw.ts';
import { getFileUrl } from '../../config.ts';
import { B2B_VERSION } from '../../constants.ts';
import { createDir as mkdirp } from '../fs.ts';
import { NMB2BTransportError } from '../NMB2BTransportError.ts';
import { downloadAndExtractWSDL } from './downloadAndExtractWSDL.ts';

const OUTPUT_DIR = path.join('/tmp', `b2b-client-test-${randomUUID()}`);

beforeEach(async () => {
  await mkdirp(OUTPUT_DIR);
  return async () => {
    await rm(OUTPUT_DIR, { force: true, recursive: true });
  };
});

describe(downloadAndExtractWSDL, () => {
  const flavour = 'PREOPS';
  const filePath = 'test.tar.gz';
  const url = getFileUrl(filePath, { flavour });
  const SECURITY = createTestSecurities().PFX;

  /**
   * Downloads the archive, which must fail with a transport error.
   */
  async function captureTransportError() {
    const error = await downloadAndExtractWSDL(withCredentialsInUrl(url), {
      security: SECURITY,
      outputDir: OUTPUT_DIR,
    }).then(
      () => expect.unreachable('downloadAndExtractWSDL() should have thrown an error'),
      (err: unknown) => err,
    );

    assert.instanceOf(error, NMB2BTransportError);
    return error;
  }

  describe('when the remote server responds with a gzipped tar archive', async () => {
    const FILES_IN_ARCHIVE = {
      [`${B2B_VERSION}/Flow.wsdl`]: '<!-- wsdl content -->',
      [`${B2B_VERSION}/common/BasicTypes.xsd`]: '<!-- xsd content -->',
      [`${B2B_VERSION}/flight/Flight.xsd`]: '<!-- flight xsd content -->',
    };
    const archive = await createMockArchive(FILES_IN_ARCHIVE);

    test('should download and extract the content of the archive', async () => {
      server.use(
        http.get(url, () => {
          /**
           * MSW type system does not accept a nodejs Buffer nor a DataView.
           *
           * We create a new ArrayBuffer
           */
          const arrayBuffer = archive.buffer.slice(
            archive.byteOffset,
            archive.byteOffset + archive.byteLength,
          );

          return HttpResponse.arrayBuffer(arrayBuffer, {
            headers: {
              'content-type': '',
            },
          });
        }),
      );

      await downloadAndExtractWSDL(
        url,
        fromPartial({
          outputDir: OUTPUT_DIR,
        }),
      );

      for (const [relativePath, expectedContent] of Object.entries(FILES_IN_ARCHIVE)) {
        /**
         * The archive structure includes a root directory named with the B2B version.
         * Since the extraction process removes this top-level directory, we strip the
         * prefix here to match the expected output path.
         */
        const parts = relativePath.split('/');
        if (parts[0] === B2B_VERSION) {
          parts.shift();
        }
        const expectedOutputPath = path.join(OUTPUT_DIR, ...parts);

        expect(await readFile(expectedOutputPath, 'utf8')).toBe(expectedContent);
      }
    });
  });

  describe.each([
    [
      'when the remote server responds with a 503',
      {
        response: { body: '<p>Unavailable</p>', status: 503, contentType: 'text/html' },
        expectedError: { kind: 'http', message: 'Unable to download WSDL: HTTP status 503' },
      },
    ],
    [
      'when the remote server responds with an invalid Content-Type',
      {
        response: { body: '<p>Bad Gateway</p>', status: 200, contentType: 'text/html' },
        expectedError: {
          kind: 'parse',
          message: 'Unable to download WSDL: Invalid Content-Type: text/html',
        },
      },
    ],
  ])('%s', (_, { response, expectedError }) => {
    const RESPONSE_HANDLER = () =>
      new HttpResponse(response.body, {
        status: response.status,
        headers: { 'content-type': response.contentType },
      });

    test(`should read "${expectedError.message}"`, async () => {
      server.use(http.get(url, RESPONSE_HANDLER));

      const error = await captureTransportError();

      expect(error.message).toBe(expectedError.message);
    });

    test(`should report kind "${expectedError.kind}"`, async () => {
      server.use(http.get(url, RESPONSE_HANDLER));

      const error = await captureTransportError();

      expect(error.kind).toBe(expectedError.kind);
    });

    test(`should report HTTP status ${response.status}`, async () => {
      server.use(http.get(url, RESPONSE_HANDLER));

      const error = await captureTransportError();

      expect(error.httpStatus).toBe(response.status);
    });

    test('should report the URL', async () => {
      server.use(http.get(url, RESPONSE_HANDLER));

      const error = await captureTransportError();

      expect(error.url).toBe(url);
    });

    test('should hold the body of the response', async () => {
      server.use(http.get(url, RESPONSE_HANDLER));

      const error = await captureTransportError();

      expect(error.body).toBe(response.body);
    });
  });

  describe('when the remote server responds with a corrupt archive', () => {
    const CORRUPT_ARCHIVE_HANDLER = () =>
      new HttpResponse('definitely not a tarball', {
        headers: { 'content-type': 'application/gzip' },
      });

    test('should report kind "parse"', async () => {
      server.use(http.get(url, CORRUPT_ARCHIVE_HANDLER));

      const error = await captureTransportError();

      expect(error.kind).toBe('parse');
    });

    test('should report the URL', async () => {
      server.use(http.get(url, CORRUPT_ARCHIVE_HANDLER));

      const error = await captureTransportError();

      expect(error.url).toBe(url);
    });

    test('should not expose any credential', async () => {
      server.use(http.get(url, CORRUPT_ARCHIVE_HANDLER));

      const error = await captureTransportError();

      expect(findCredentialPaths(error, SECURITY, [URL_PASSWORD])).toEqual([]);
    });
  });

  describe.each([
    [
      'when the connection is lost while reading the archive',
      { response: { status: 200, contentType: 'application/gzip' } },
    ],
    [
      'when the connection is lost while reading an error page',
      { response: { status: 503, contentType: 'text/html' } },
    ],
  ])('%s', (_, { response }) => {
    const LOST_CONNECTION_HANDLER = () => {
      const body = new ReadableStream({
        async pull(controller) {
          controller.enqueue(new TextEncoder().encode('partial'));
          await delay(20);
          controller.error(new Error('Connection lost'));
        },
      });

      return new HttpResponse(body, {
        status: response.status,
        headers: { 'content-type': response.contentType },
      });
    };

    test('should report kind "network"', async () => {
      server.use(http.get(url, LOST_CONNECTION_HANDLER));

      const error = await captureTransportError();

      expect(error.kind).toBe('network');
    });

    test('should report the URL', async () => {
      server.use(http.get(url, LOST_CONNECTION_HANDLER));

      const error = await captureTransportError();

      expect(error.url).toBe(url);
    });

    test('should not expose any credential', async () => {
      server.use(http.get(url, LOST_CONNECTION_HANDLER));

      const error = await captureTransportError();

      expect(findCredentialPaths(error, SECURITY, [URL_PASSWORD])).toEqual([]);
    });
  });
});
