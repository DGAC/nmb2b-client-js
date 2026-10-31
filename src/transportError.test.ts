import { delay, http, HttpResponse } from 'msw';
import { assert, describe, expect, test } from 'vitest';

import { MOCK_B2B_ENDPOINT } from '../tests/constants.ts';
import { TEST_B2B_OPTIONS } from '../tests/options.ts';
import {
  createTestSecurities,
  findCredentialPaths,
  URL_PASSWORD,
  withCredentialsInUrl,
} from '../tests/utils/credentials.ts';
import { server, SOAP_ENDPOINT } from '../tests/utils/msw.ts';
import { withTempDirectory } from '../tests/utils/withTempDirectory.ts';
import { getSoapEndpoint } from './config.ts';
import {
  createB2BClient,
  createGeneralInformationClient,
  createHook,
  NMB2BTransportError,
} from './index.ts';
import type { Security } from './security.ts';

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

const WSDL_ARCHIVE_URL = 'https://fake-b2b.test/wsdl/archive.tar.gz';
const WSDL_LOOKUP_URL = getSoapEndpoint({ flavour: TEST_B2B_OPTIONS.flavour });

/** Body of the reply seen on `retrieveEAUPChain` against real B2B. */
const OBSERVED_BODY = '{"message": "Endpoint request timed out"}';

const FAULT_ENVELOPE = `<?xml version="1.0" encoding="UTF-8"?>
<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
  <S:Body>
    <S:Fault>
      <faultcode>S:Server</faultcode>
      <faultstring>Internal failure</faultstring>
    </S:Fault>
  </S:Body>
</S:Envelope>`;

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
      expect(error.message).toBe(
        '[Query GeneralInformation.retrieveUserInformation] Error thrown during query execution: Network error',
      );
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

    test('an invalid response body is a parse transport error', async () => {
      server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.text('not xml at all')));

      const { client, hookErrors } = await createClientWithCredentialsInUrl(security);
      const error = await captureError(client.retrieveUserInformation({}));

      assert.instanceOf(error, NMB2BTransportError);
      expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      expect(hookErrors).toHaveLength(1);
      expect(hookErrors[0]).toBe(error);
      expect(error).toMatchObject({ kind: 'parse', httpStatus: 200 });
      expect(error.message).toBe(
        '[Query GeneralInformation.retrieveUserInformation] Error thrown during query execution: Invalid response body (HTTP status 200)',
      );
      expect(error.body).toBe('not xml at all');
    });

    describe.each([
      [
        'with a 504, with a JSON body',
        {
          response: { body: OBSERVED_BODY, statusCode: 504, contentType: 'application/json' },
          expectedError: { kind: 'http', message: 'HTTP status 504' },
        },
      ],
      [
        'with a 502, with an HTML page',
        {
          response: { body: '<p>Bad Gateway</p>', statusCode: 502, contentType: 'text/html' },
          expectedError: { kind: 'http', message: 'HTTP status 502' },
        },
      ],
      [
        'with a 504, with an empty body',
        {
          response: { body: '', statusCode: 504, contentType: 'text/plain' },
          expectedError: { kind: 'http', message: 'HTTP status 504' },
        },
      ],
      [
        'with a 200, with a JSON body',
        {
          response: { body: OBSERVED_BODY, statusCode: 200, contentType: 'application/json' },
          expectedError: { kind: 'parse', message: 'Invalid response body (HTTP status 200)' },
        },
      ],
      [
        'with a 302, with an HTML page',
        {
          response: {
            body: '<html><body>Moved</body></html>',
            statusCode: 302,
            contentType: 'text/html',
          },
          expectedError: { kind: 'parse', message: 'Invalid response body (HTTP status 302)' },
        },
      ],
    ])('%s', (_, { response, expectedError }) => {
      async function captureTransportError() {
        server.use(
          http.post(
            SOAP_ENDPOINT,
            () =>
              new HttpResponse(response.body, {
                status: response.statusCode,
                headers: { 'content-type': response.contentType },
              }),
          ),
        );

        const { client } = await createClientWithCredentialsInUrl(security);
        const error = await captureError(client.retrieveUserInformation({}));

        assert.instanceOf(error, NMB2BTransportError);
        return error;
      }

      test(`should read "${expectedError.message}"`, async () => {
        const error = await captureTransportError();

        expect(error.message).toBe(
          `[Query GeneralInformation.retrieveUserInformation] Error thrown during query execution: ${expectedError.message}`,
        );
      });

      test(`should report kind "${expectedError.kind}" with the status, URL and body of the response`, async () => {
        const error = await captureTransportError();

        expect(error).toMatchObject({
          kind: expectedError.kind,
          httpStatus: response.statusCode,
          url: SOAP_ENDPOINT,
        });
        expect(error.body).toBe(response.body);
      });

      test('should not expose any credential', async () => {
        const error = await captureTransportError();

        expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      });
    });

    test('a SOAP fault is a fault transport error with the fault envelope as body', async () => {
      server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(FAULT_ENVELOPE, { status: 500 })));

      const { client, hookErrors } = await createClientWithCredentialsInUrl(security);
      const error = await captureError(client.retrieveUserInformation({}));

      assert.instanceOf(error, NMB2BTransportError);
      expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      expect(hookErrors).toHaveLength(1);
      expect(hookErrors[0]).toBe(error);
      expect(error).toMatchObject({ kind: 'fault', httpStatus: 500 });
      expect(error.body).toBe(FAULT_ENVELOPE);
    });

    test('a SOAP fault keeps its own message', async () => {
      server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(FAULT_ENVELOPE, { status: 500 })));

      const { client } = await createClientWithCredentialsInUrl(security);
      const error = await captureError(client.retrieveUserInformation({}));

      expect(error.message).toBe(
        '[Query GeneralInformation.retrieveUserInformation] Error thrown during query execution: S:Server: Internal failure',
      );
    });
  });

  describe('loading the WSDL archive without a usable reply', () => {
    test('a network failure is a network transport error', async () => {
      server.use(http.get(WSDL_ARCHIVE_URL, () => HttpResponse.error()));
      await using xsd = await withTempDirectory('b2b-client-test-xsd-');

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
      await using xsd = await withTempDirectory('b2b-client-test-xsd-');

      const error = await captureError(
        createClientWithEmptyCache(security, xsd.path, WSDL_ARCHIVE_URL),
      );

      assert.instanceOf(error, NMB2BTransportError);
      expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      expect(error).toMatchObject({ kind: 'http', httpStatus: 503, url: WSDL_ARCHIVE_URL });
      expect(error.message).toBe('Unable to download WSDL: HTTP status 503');
      expect(error.body).toBe('<p>Unavailable</p>');
    });

    test('an invalid content type is a parse transport error with its body', async () => {
      server.use(http.get(WSDL_ARCHIVE_URL, () => HttpResponse.html('<p>Bad Gateway</p>')));
      await using xsd = await withTempDirectory('b2b-client-test-xsd-');

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
      await using xsd = await withTempDirectory('b2b-client-test-xsd-');

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
        await using xsd = await withTempDirectory('b2b-client-test-xsd-');

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
    await using xsd = await withTempDirectory('b2b-client-test-xsd-');

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
    await using xsd = await withTempDirectory('b2b-client-test-xsd-');

    const error = await captureError(createClientWithEmptyCache(security, xsd.path, undefined));

    assert.instanceOf(error, NMB2BTransportError);
    expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
    expect(error).toMatchObject({ kind: 'http', httpStatus: 503, url: WSDL_LOOKUP_URL });
    expect(error.message).toBe('Request failed with status code 503');
    expect(error.body).toBe('<p>Unavailable</p>');
  });

  test('a reply without a WSDL file is a parse transport error with its body', async () => {
    server.use(http.post(WSDL_LOOKUP_URL, () => HttpResponse.xml('<reply/>')));
    await using xsd = await withTempDirectory('b2b-client-test-xsd-');

    const error = await captureError(createClientWithEmptyCache(security, xsd.path, undefined));

    assert.instanceOf(error, NMB2BTransportError);
    expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
    expect(error).toMatchObject({ kind: 'parse', httpStatus: 200, url: WSDL_LOOKUP_URL });
    expect(error.body).toBe('<reply/>');
  });
});
