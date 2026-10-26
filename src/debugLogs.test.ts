import createDebug from 'debug';
import { http, HttpResponse } from 'msw';
import { format } from 'node:util';
import { create as createTar } from 'tar';
import { expect, test } from 'vitest';
import { TEST_B2B_OPTIONS } from '../tests/options.ts';
import { MOCK_B2B_ENDPOINT, MOCK_B2B_XSD_ENDPOINT } from '../tests/constants.ts';
import { URL_PASSWORD, withCredentialsInUrl } from '../tests/utils/credentials.ts';
import { server } from '../tests/utils/msw.ts';
import { withTempDirectory } from '../tests/utils/withTempDirectory.ts';
import { getXSDCacheDirectory } from './utils/xsd/paths.ts';
import { createB2BClient } from './index.ts';

const WSDL_ARCHIVE_URL = 'https://fake-b2b.test/wsdl/archive.tar.gz';

/**
 * Packs the WSDL files the unit tests use into an archive shaped like the one
 * B2B serves: a single top-level directory.
 */
async function createWSDLArchive(): Promise<ArrayBuffer> {
  const directory = getXSDCacheDirectory({
    XSD_PATH: TEST_B2B_OPTIONS.XSD_PATH,
    xsdEndpoint: MOCK_B2B_XSD_ENDPOINT,
  });

  const chunks: Array<Buffer> = [];
  for await (const chunk of createTar({ gzip: true, cwd: directory, follow: true }, ['.'])) {
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
  const archive = await createWSDLArchive();
  server.use(
    http.get(WSDL_ARCHIVE_URL, () =>
      HttpResponse.arrayBuffer(archive, { headers: { 'content-type': 'application/gzip' } }),
    ),
  );

  await using xsd = await withTempDirectory('b2b-client-debug-logs-');
  using output = withCapturedDebugOutput();

  await createB2BClient({
    ...TEST_B2B_OPTIONS,
    XSD_PATH: xsd.path,
    endpoint: withCredentialsInUrl(MOCK_B2B_ENDPOINT),
    xsdEndpoint: withCredentialsInUrl(WSDL_ARCHIVE_URL),
  });

  expect(output.lines.join('\n')).toContain(`Downloading ${WSDL_ARCHIVE_URL}`);
  expect(output.lines.filter((line) => line.includes(URL_PASSWORD))).toEqual([]);
});
