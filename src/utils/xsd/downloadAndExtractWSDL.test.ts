import { fromPartial } from '@total-typescript/shoehorn';
import { http, HttpResponse } from 'msw';
import { randomUUID } from 'node:crypto';
import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { beforeEach, describe, expect, test, assert } from 'vitest';
import { createMockArchive } from '../../../tests/utils.js';
import { server } from '../../../tests/utils/msw.js';
import { getFileUrl } from '../../config.js';
import { B2B_VERSION } from '../../constants.js';
import { createDir as mkdirp } from '../fs.js';
import { downloadAndExtractWSDL } from './downloadAndExtractWSDL.js';

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

      for (const [relativePath, expectedContent] of Object.entries(
        FILES_IN_ARCHIVE,
      )) {
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

        // oxlint-disable-next-line no-await-in-loop
        expect(await readFile(expectedOutputPath, 'utf8')).toBe(
          expectedContent,
        );
      }
    });
  });

  describe('when the remote server responds with an http error', () => {
    test('should throw an error', async () => {
      server.use(
        http.get(url, () => {
          return new HttpResponse(null, { status: 503 });
        }),
      );

      try {
        await downloadAndExtractWSDL(
          url,
          fromPartial({
            outputDir: OUTPUT_DIR,
          }),
        );
        expect.unreachable(
          'downloadAndExtractWSDL() should have thrown an error',
        );
      } catch (err) {
        assert.instanceOf(err, Error);
        expect(err.message).toMatch(/Unable.*WSDL.*/);
      }
    });
  });

  describe('when the remote server responds with an invalid content-type', () => {
    test('should throw a clear error (e.g. HTML proxy error)', async () => {
      server.use(
        http.get(url, () => {
          return new HttpResponse('<html><body>Bad Gateway</body></html>', {
            headers: {
              'content-type': 'text/html; charset=utf-8',
            },
          });
        }),
      );

      try {
        await downloadAndExtractWSDL(
          url,
          fromPartial({
            outputDir: OUTPUT_DIR,
          }),
        );
        expect.unreachable(
          'downloadAndExtractWSDL() should have thrown an error',
        );
      } catch (err) {
        assert.instanceOf(err, Error);
        expect(err.message).toMatch(/Invalid Content-Type/);
      }
    });
  });
});
