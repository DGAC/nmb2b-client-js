import { format } from 'node:util';

import createDebug from 'debug';
import { http, HttpResponse } from 'msw';
import { create as createTar } from 'tar';
import { assert, expect, test } from 'vitest';

import { MOCK_B2B_ENDPOINT } from '../tests/constants.ts';
import { TEST_B2B_OPTIONS } from '../tests/options.ts';
import { URL_PASSWORD, withCredentialsInUrl } from '../tests/utils/credentials.ts';
import { server } from '../tests/utils/msw.ts';
import { withTempDirectory } from '../tests/utils/withTempDirectory.ts';
import { createB2BClient } from './index.ts';

const WSDL_ARCHIVE_URL = 'https://fake-b2b.test/wsdl/archive.tar.gz';

/**
 * Packs an empty directory into an archive in the format B2B serves.
 */
async function createEmptyWSDLArchive(): Promise<ArrayBuffer> {
  await using directory = await withTempDirectory('b2b-client-empty-wsdl-');

  const chunks: Array<Buffer> = [];
  for await (const chunk of createTar({ gzip: true, cwd: directory.path }, ['.'])) {
    chunks.push(Buffer.from(chunk));
  }

  return new Uint8Array(Buffer.concat(chunks)).buffer;
}

/**
 * Enables every debug namespace of the library and captures what it logs,
 * until disposed.
 */
function withCapturedDebugOutput() {
  const lines: Array<string> = [];
  const previousNamespaces = createDebug.disable();
  const previousLog = createDebug.log;

  createDebug.enable('@dgac/nmb2b-client*');
  createDebug.log = (...args: Array<unknown>) => {
    lines.push(format(...args));
  };

  return {
    lines,
    [Symbol.dispose]: () => {
      createDebug.log = previousLog;
      createDebug.enable(previousNamespaces);
    },
  };
}

test('debug logs never contain credentials of configured URLs', async () => {
  const archive = await createEmptyWSDLArchive();
  server.use(
    http.get(WSDL_ARCHIVE_URL, () =>
      HttpResponse.arrayBuffer(archive, { headers: { 'content-type': 'application/gzip' } }),
    ),
  );

  await using xsd = await withTempDirectory('b2b-client-debug-logs-');
  using output = withCapturedDebugOutput();

  // URLs are logged up to the WSDL download. With an empty archive, building
  // the SOAP clients then fails: parsing every WSDL is too slow for this test.
  await createB2BClient({
    ...TEST_B2B_OPTIONS,
    XSD_PATH: xsd.path,
    endpoint: withCredentialsInUrl(MOCK_B2B_ENDPOINT),
    xsdEndpoint: withCredentialsInUrl(WSDL_ARCHIVE_URL),
  }).then(
    () => expect.unreachable('the archive holds no WSDL to build clients from'),
    (err: unknown) => {
      assert.instanceOf(err, Error);
      assert('code' in err && err.code === 'ENOENT');
      assert.include(err.message, xsd.path);
    },
  );

  expect(output.lines.join('\n')).toContain(`Downloading ${WSDL_ARCHIVE_URL}`);
  expect(output.lines.filter((line) => line.includes(URL_PASSWORD))).toEqual([]);
});
