import { delay, http, HttpResponse } from 'msw';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { assert, describe, expect, test } from 'vitest';
import { TEST_B2B_OPTIONS } from '../tests/options.ts';
import {
  createTestSecurities,
  findCredentialPaths,
  URL_PASSWORD,
  withCredentialsInUrl,
} from '../tests/utils/credentials.ts';
import { MOCK_B2B_ENDPOINT } from '../tests/constants.ts';
import { server, SOAP_ENDPOINT } from '../tests/utils/msw.ts';
import { getSoapEndpoint } from './config.ts';
import type { Security } from './security.ts';
import {
  createB2BClient,
  createGeneralInformationClient,
  createHook,
  NMB2BTransportError,
} from './index.ts';

/**
 * Awaits `promise`, which must reject with an `Error`, and returns that error.
 */
async function captureError(promise: Promise<unknown>): Promise<Error> {
  const error = await promise.then(
    () => expect.unreachable('the promise should have rejected'),
    (err: unknown) => err,
  );

  assert.instanceOf(error, Error);
  return error;
}

/**
 * Creates a `GeneralInformation` client for whatever MSW answers, with
 * credentials in its endpoint URL too, and the errors its `onRequestError`
 * hook receives.
 */
async function createClientWithCredentialsInUrl(security: Security) {
  const hookErrors: Array<Error> = [];
  const client = await createGeneralInformationClient({
    ...TEST_B2B_OPTIONS,
    endpoint: withCredentialsInUrl(MOCK_B2B_ENDPOINT),
    security,
    hooks: [
      createHook(() => ({
        onRequestError: ({ error }) => {
          hookErrors.push(error);
        },
      })),
    ],
  });

  return { client, hookErrors };
}

/**
 * Creates a client with the empty WSDL cache `XSD_PATH`, so that it loads the
 * WSDL from whatever MSW answers, with credentials in `xsdEndpoint` too.
 */
function createClientWithEmptyCache(
  security: Security,
  XSD_PATH: string,
  xsdEndpoint: string | undefined,
) {
  return createB2BClient({
    ...TEST_B2B_OPTIONS,
    XSD_PATH,
    security,
    xsdEndpoint: xsdEndpoint && withCredentialsInUrl(xsdEndpoint),
  });
}

/**
 * Creates an empty temporary directory, removed when disposed.
 */
async function createTempDirectory(prefix: string) {
  const directory = await mkdtemp(path.join(os.tmpdir(), prefix));

  return {
    path: directory,
    [Symbol.asyncDispose]: () => rm(directory, { recursive: true, force: true }),
  };
}

const WSDL_ARCHIVE_URL = 'https://fake-b2b.test/wsdl/archive.tar.gz';
const WSDL_LOOKUP_URL = getSoapEndpoint({ flavour: TEST_B2B_OPTIONS.flavour });

const SECURITIES = createTestSecurities();

describe.each(Object.entries(SECURITIES))('with %s security', (_, security) => {
  describe('a SOAP query without a usable reply', () => {
    test('a network failure is a network transport error', async () => {
      server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.error()));

      const { client, hookErrors } = await createClientWithCredentialsInUrl(security);
      const error = await captureError(client.retrieveUserInformation({}));

      assert.instanceOf(error, NMB2BTransportError);
      expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      expect(hookErrors).toHaveLength(1);
      expect(hookErrors[0]).toBe(error);
      expect(error).toMatchObject({
        kind: 'network',
        service: 'GeneralInformation',
        query: 'retrieveUserInformation',
        url: SOAP_ENDPOINT,
      });
      expect(error.message).toMatch(/^\[Query GeneralInformation\.retrieveUserInformation\] /);
      expect(error.httpStatus).toBeUndefined();
    });

    test('a timeout is a network transport error with its system code', async () => {
      server.use(
        http.post(SOAP_ENDPOINT, async () => {
          await delay(100);
          return HttpResponse.xml('<foo/>');
        }),
      );

      const { client, hookErrors } = await createClientWithCredentialsInUrl(security);
      const error = await captureError(client.retrieveUserInformation({}, { timeout: 10 }));

      assert.instanceOf(error, NMB2BTransportError);
      expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      expect(hookErrors).toHaveLength(1);
      expect(hookErrors[0]).toBe(error);
      expect(error).toMatchObject({ kind: 'network', code: 'ECONNABORTED' });
      expect(error.message).toMatch(/timeout/i);
    });

    test('a proxy error page is an http transport error with its full body', async () => {
      const page = `<html><body>${'Bad Gateway '.repeat(10_000)}</body></html>`;
      server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.html(page, { status: 502 })));

      const { client, hookErrors } = await createClientWithCredentialsInUrl(security);
      const error = await captureError(client.retrieveUserInformation({}));

      assert.instanceOf(error, NMB2BTransportError);
      expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      expect(hookErrors).toHaveLength(1);
      expect(hookErrors[0]).toBe(error);
      expect(error).toMatchObject({
        kind: 'http',
        httpStatus: 502,
        service: 'GeneralInformation',
        query: 'retrieveUserInformation',
        url: SOAP_ENDPOINT,
      });
      expect(error.body).toBe(page);
      expect(Object.keys(error)).not.toContain('body');
      expect(JSON.stringify(error)).not.toContain('Bad Gateway');
    });

    test('an unreadable reply is a parse transport error', async () => {
      server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.text('not xml at all')));

      const { client, hookErrors } = await createClientWithCredentialsInUrl(security);
      const error = await captureError(client.retrieveUserInformation({}));

      assert.instanceOf(error, NMB2BTransportError);
      expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      expect(hookErrors).toHaveLength(1);
      expect(hookErrors[0]).toBe(error);
      expect(error).toMatchObject({ kind: 'parse', httpStatus: 200 });
      expect(error.body).toBe('not xml at all');
    });

    test('a SOAP fault is a fault transport error with the fault envelope as body', async () => {
      const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
  <S:Body>
    <S:Fault>
      <faultcode>S:Server</faultcode>
      <faultstring>Internal failure</faultstring>
    </S:Fault>
  </S:Body>
</S:Envelope>`;
      server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(envelope, { status: 500 })));

      const { client, hookErrors } = await createClientWithCredentialsInUrl(security);
      const error = await captureError(client.retrieveUserInformation({}));

      assert.instanceOf(error, NMB2BTransportError);
      expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      expect(hookErrors).toHaveLength(1);
      expect(hookErrors[0]).toBe(error);
      expect(error).toMatchObject({ kind: 'fault', httpStatus: 500 });
      expect(error.message).toMatch(/Internal failure/);
      expect(error.body).toBe(envelope);
    });
  });

  describe('loading the WSDL archive without a usable reply', () => {
    test('a network failure is a network transport error', async () => {
      server.use(http.get(WSDL_ARCHIVE_URL, () => HttpResponse.error()));
      await using xsd = await createTempDirectory('b2b-client-test-xsd-');

      const error = await captureError(
        createClientWithEmptyCache(security, xsd.path, WSDL_ARCHIVE_URL),
      );

      assert.instanceOf(error, NMB2BTransportError);
      expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      expect(error).toMatchObject({ kind: 'network', url: WSDL_ARCHIVE_URL });
      expect(error.message).toMatch(/^Unable to download WSDL: /);
      expect(error.service).toBeUndefined();
      expect(error.query).toBeUndefined();
    });

    test('an error status is an http transport error with its body', async () => {
      server.use(
        http.get(WSDL_ARCHIVE_URL, () => HttpResponse.html('<p>Unavailable</p>', { status: 503 })),
      );
      await using xsd = await createTempDirectory('b2b-client-test-xsd-');

      const error = await captureError(
        createClientWithEmptyCache(security, xsd.path, WSDL_ARCHIVE_URL),
      );

      assert.instanceOf(error, NMB2BTransportError);
      expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      expect(error).toMatchObject({ kind: 'http', httpStatus: 503, url: WSDL_ARCHIVE_URL });
      expect(error.body).toBe('<p>Unavailable</p>');
    });

    test('an invalid content type is a parse transport error with its body', async () => {
      server.use(http.get(WSDL_ARCHIVE_URL, () => HttpResponse.html('<p>Bad Gateway</p>')));
      await using xsd = await createTempDirectory('b2b-client-test-xsd-');

      const error = await captureError(
        createClientWithEmptyCache(security, xsd.path, WSDL_ARCHIVE_URL),
      );

      assert.instanceOf(error, NMB2BTransportError);
      expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      expect(error).toMatchObject({ kind: 'parse', httpStatus: 200, url: WSDL_ARCHIVE_URL });
      expect(error.message).toMatch(/Invalid Content-Type/);
      expect(error.body).toBe('<p>Bad Gateway</p>');
    });

    test('a corrupt archive is a parse transport error', async () => {
      server.use(
        http.get(
          WSDL_ARCHIVE_URL,
          () =>
            new HttpResponse('definitely not a tarball', {
              headers: { 'content-type': 'application/gzip' },
            }),
        ),
      );
      await using xsd = await createTempDirectory('b2b-client-test-xsd-');

      const error = await captureError(
        createClientWithEmptyCache(security, xsd.path, WSDL_ARCHIVE_URL),
      );

      assert.instanceOf(error, NMB2BTransportError);
      expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      expect(error).toMatchObject({ kind: 'parse', url: WSDL_ARCHIVE_URL });
    });

    test.each([
      ['the archive', 'application/gzip', 200],
      ['an error page', 'text/html', 503],
    ])(
      'a connection lost while reading %s is a network transport error',
      async (_, contentType, status) => {
        server.use(
          http.get(WSDL_ARCHIVE_URL, () => {
            const body = new ReadableStream({
              async pull(controller) {
                controller.enqueue(new TextEncoder().encode('partial'));
                await delay(20);
                controller.error(new Error('Connection lost'));
              },
            });

            return new HttpResponse(body, { status, headers: { 'content-type': contentType } });
          }),
        );
        await using xsd = await createTempDirectory('b2b-client-test-xsd-');

        const error = await captureError(
          createClientWithEmptyCache(security, xsd.path, WSDL_ARCHIVE_URL),
        );

        assert.instanceOf(error, NMB2BTransportError);
        expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
        expect(error).toMatchObject({ kind: 'network', url: WSDL_ARCHIVE_URL });
      },
    );
  });
});

/**
 * The WSDL URL lookup only happens without `xsdEndpoint`, which API Gateway
 * security requires: only certificate security goes through it.
 */
describe.each([
  ['PFX', SECURITIES.PFX],
  ['PEM', SECURITIES.PEM],
])('with %s security, looking up the WSDL URL without a usable reply', (_, security) => {
  test('a network failure is a network transport error', async () => {
    server.use(http.post(WSDL_LOOKUP_URL, () => HttpResponse.error()));
    await using xsd = await createTempDirectory('b2b-client-test-xsd-');

    const error = await captureError(createClientWithEmptyCache(security, xsd.path, undefined));

    assert.instanceOf(error, NMB2BTransportError);
    expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
    expect(error).toMatchObject({ kind: 'network', url: WSDL_LOOKUP_URL });
    expect(error.service).toBeUndefined();
    expect(error.query).toBeUndefined();
  });

  test('an error status is an http transport error with its body', async () => {
    server.use(
      http.post(WSDL_LOOKUP_URL, () => HttpResponse.html('<p>Unavailable</p>', { status: 503 })),
    );
    await using xsd = await createTempDirectory('b2b-client-test-xsd-');

    const error = await captureError(createClientWithEmptyCache(security, xsd.path, undefined));

    assert.instanceOf(error, NMB2BTransportError);
    expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
    expect(error).toMatchObject({ kind: 'http', httpStatus: 503, url: WSDL_LOOKUP_URL });
    expect(error.body).toBe('<p>Unavailable</p>');
  });

  test('a reply without a WSDL file is a parse transport error with its body', async () => {
    server.use(http.post(WSDL_LOOKUP_URL, () => HttpResponse.xml('<reply/>')));
    await using xsd = await createTempDirectory('b2b-client-test-xsd-');

    const error = await captureError(createClientWithEmptyCache(security, xsd.path, undefined));

    assert.instanceOf(error, NMB2BTransportError);
    expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
    expect(error).toMatchObject({ kind: 'parse', httpStatus: 200, url: WSDL_LOOKUP_URL });
    expect(error.body).toBe('<reply/>');
  });
});
