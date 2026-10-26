import createDebug from 'debug';
import { http, HttpResponse } from 'msw';
import { mkdtemp, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { format } from 'node:util';
import { create as createTar } from 'tar';
import { expect, test } from 'vitest';
import { TEST_B2B_OPTIONS } from '../tests/options.ts';
import { MOCK_B2B_ENDPOINT, MOCK_B2B_XSD_ENDPOINT } from '../tests/constants.ts';
import { server } from '../tests/utils/msw.ts';
import { getXSDCacheDirectory } from './utils/xsd/paths.ts';
import { createB2BClient } from './index.ts';

const WSDL_ARCHIVE_URL = 'https://fake-b2b.test/wsdl/archive.tar.gz';

/** A password put in a configured URL, unique to this run. */
const URL_PASSWORD = `test-url-password-${randomUUID()}`;

function withCredentialsInUrl(url: string): string {
  const parsed = new URL(url);
  parsed.username = 'test-url-user';
  parsed.password = URL_PASSWORD;
  return parsed.toString();
}

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

  const XSD_PATH = await mkdtemp(path.join(os.tmpdir(), 'b2b-client-debug-logs-'));

  try {
    using output = withCapturedDebugOutput();

    await createB2BClient({
      ...TEST_B2B_OPTIONS,
      XSD_PATH,
      endpoint: withCredentialsInUrl(MOCK_B2B_ENDPOINT),
      xsdEndpoint: withCredentialsInUrl(WSDL_ARCHIVE_URL),
    });

    expect(output.lines.join('\n')).toContain(`Downloading ${WSDL_ARCHIVE_URL}`);
    expect(output.lines.filter((line) => line.includes(URL_PASSWORD))).toEqual([]);
  } finally {
    await rm(XSD_PATH, { recursive: true, force: true });
  }
});
