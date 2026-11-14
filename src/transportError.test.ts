import { delay, http, HttpResponse, type HttpResponseResolver } from 'msw';
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
import { createB2BClient, createHook, NMB2BTransportError } from './index.ts';
import type { Security } from './security.ts';

const WSDL_ARCHIVE_URL = 'https://fake-b2b.test/wsdl/archive.tar.gz';
const WSDL_LOOKUP_URL = getSoapEndpoint({ flavour: TEST_B2B_OPTIONS.flavour });

const SECURITIES = createTestSecurities();

/**
 * The fields of a transport error do not depend on the security: its modes only
 * differ on credentials. This one goes through every step of loading the WSDL.
 */
const SECURITY = SECURITIES.PFX;

const QUERY_MESSAGE_PREFIX =
  '[Query GeneralInformation.retrieveUserInformation] Error thrown during query execution: ';

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

type Failure = {
  handler: HttpResponseResolver;
  requestOptions?: { timeout: number };
  expectedError: Pick<NMB2BTransportError, 'kind' | 'message' | 'code' | 'httpStatus' | 'body'>;
};

/**
 * What `soap` and axios really throw, on each kind of failure of a query.
 */
const QUERY_FAILURES: Array<[string, Failure]> = [
  [
    'with a network failure',
    {
      handler: () => HttpResponse.error(),
      expectedError: { kind: 'network', message: 'Network error' },
    },
  ],
  [
    'with a timeout',
    {
      handler: async () => {
        await delay(100);
        return HttpResponse.xml('<foo/>');
      },
      requestOptions: { timeout: 10 },
      expectedError: { kind: 'network', message: 'timeout of 10ms exceeded', code: 'ECONNABORTED' },
    },
  ],
  [
    'with a 504, with a JSON body',
    {
      handler: () => HttpResponse.json(JSON.parse(OBSERVED_BODY), { status: 504 }),
      expectedError: {
        kind: 'http',
        message: 'HTTP status 504',
        httpStatus: 504,
        body: JSON.stringify(JSON.parse(OBSERVED_BODY)),
      },
    },
  ],
  [
    'with a 502, with an HTML page',
    {
      handler: () => HttpResponse.html('<p>Bad Gateway</p>', { status: 502 }),
      expectedError: {
        kind: 'http',
        message: 'HTTP status 502',
        httpStatus: 502,
        body: '<p>Bad Gateway</p>',
      },
    },
  ],
  [
    'with a 200, with a JSON body',
    {
      handler: () => HttpResponse.json(JSON.parse(OBSERVED_BODY)),
      expectedError: {
        kind: 'parse',
        message: 'Invalid response body (HTTP status 200)',
        httpStatus: 200,
        body: JSON.stringify(JSON.parse(OBSERVED_BODY)),
      },
    },
  ],
  [
    'with a 500, with a SOAP fault',
    {
      handler: () =>
        new HttpResponse(FAULT_ENVELOPE, {
          status: 500,
          headers: { 'content-type': 'text/xml' },
        }),
      expectedError: {
        kind: 'fault',
        message: 'S:Server: Internal failure',
        httpStatus: 500,
        body: FAULT_ENVELOPE,
      },
    },
  ],
];

const WSDL_LOOKUP_FAILURES: Array<[string, Failure]> = [
  [
    'with a network failure',
    {
      handler: () => HttpResponse.error(),
      expectedError: { kind: 'network', message: 'Network error' },
    },
  ],
  [
    'with a 503, with an HTML page',
    {
      handler: () => HttpResponse.html('<p>Unavailable</p>', { status: 503 }),
      expectedError: {
        kind: 'http',
        message: 'Request failed with status code 503',
        httpStatus: 503,
        body: '<p>Unavailable</p>',
      },
    },
  ],
  [
    'with a 200, without a WSDL file',
    {
      handler: () => HttpResponse.xml('<reply/>'),
      expectedError: {
        kind: 'parse',
        message: 'Could not extract WSDL tarball file from B2B response',
        httpStatus: 200,
        body: '<reply/>',
      },
    },
  ],
];

const WSDL_ARCHIVE_FAILURES: Array<[string, Failure]> = [
  [
    'with a network failure',
    {
      handler: () => HttpResponse.error(),
      expectedError: { kind: 'network', message: 'Unable to download WSDL: Network error' },
    },
  ],
  [
    'with a 503, with an HTML page',
    {
      handler: () => HttpResponse.html('<p>Unavailable</p>', { status: 503 }),
      expectedError: {
        kind: 'http',
        message: 'Unable to download WSDL: HTTP status 503',
        httpStatus: 503,
        body: '<p>Unavailable</p>',
      },
    },
  ],
  [
    'with a 200, with an invalid Content-Type',
    {
      handler: () => HttpResponse.html('<p>Bad Gateway</p>'),
      expectedError: {
        kind: 'parse',
        message: 'Unable to download WSDL: Invalid Content-Type: text/html',
        httpStatus: 200,
        body: '<p>Bad Gateway</p>',
      },
    },
  ],
];

/**
 * Awaits `promise`, which must reject with a transport error, and returns that
 * error.
 */
async function captureTransportError(promise: Promise<unknown>) {
  const error = await promise.then(
    () => expect.unreachable('the promise should have rejected'),
    (err: unknown) => err,
  );

  assert.instanceOf(error, NMB2BTransportError);
  return error;
}

/**
 * Sends a query which must fail, from a client with credentials in its endpoint
 * URL too. Returns the error, and the errors its `onRequestError` hook received.
 */
async function captureQueryError(security: Security, requestOptions?: { timeout: number }) {
  const hookErrors: Array<Error> = [];
  const client = await createB2BClient({
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

  // A copy: `soap` writes the security options to the object it receives, and
  // the rows of a table are shared between securities.
  const error = await captureTransportError(
    client.GeneralInformation.retrieveUserInformation({}, { ...requestOptions }),
  );

  return { error, hookErrors };
}

/**
 * Creates a client with an empty WSDL cache, which must fail to load the WSDL,
 * with credentials in `xsdEndpoint` too.
 */
async function captureWSDLError(security: Security, xsdEndpoint?: string) {
  await using xsd = await withTempDirectory('b2b-client-test-xsd-');

  return await captureTransportError(
    createB2BClient({
      ...TEST_B2B_OPTIONS,
      XSD_PATH: xsd.path,
      security,
      xsdEndpoint: xsdEndpoint && withCredentialsInUrl(xsdEndpoint),
    }),
  );
}

describe(createB2BClient, () => {
  describe('when a query fails', () => {
    describe.each(QUERY_FAILURES)('%s', (_, { handler, requestOptions, expectedError }) => {
      test(`should read "${expectedError.message}"`, async () => {
        server.use(http.post(SOAP_ENDPOINT, handler));

        const { error } = await captureQueryError(SECURITY, requestOptions);

        expect(error.message).toBe(`${QUERY_MESSAGE_PREFIX}${expectedError.message}`);
      });

      test(`should report kind "${expectedError.kind}"`, async () => {
        server.use(http.post(SOAP_ENDPOINT, handler));

        const { error } = await captureQueryError(SECURITY, requestOptions);

        expect(error.kind).toBe(expectedError.kind);
      });

      test('should report the system code, if any', async () => {
        server.use(http.post(SOAP_ENDPOINT, handler));

        const { error } = await captureQueryError(SECURITY, requestOptions);

        expect(error.code).toBe(expectedError.code);
      });

      test('should report the HTTP status, if any', async () => {
        server.use(http.post(SOAP_ENDPOINT, handler));

        const { error } = await captureQueryError(SECURITY, requestOptions);

        expect(error.httpStatus).toBe(expectedError.httpStatus);
      });

      test('should hold the body of the response, if any', async () => {
        server.use(http.post(SOAP_ENDPOINT, handler));

        const { error } = await captureQueryError(SECURITY, requestOptions);

        expect(error.body).toBe(expectedError.body);
      });

      test('should report the URL', async () => {
        server.use(http.post(SOAP_ENDPOINT, handler));

        const { error } = await captureQueryError(SECURITY, requestOptions);

        expect(error.url).toBe(SOAP_ENDPOINT);
      });

      test('should name the service and the query', async () => {
        server.use(http.post(SOAP_ENDPOINT, handler));

        const { error } = await captureQueryError(SECURITY, requestOptions);

        expect(error).toMatchObject({
          service: 'GeneralInformation',
          query: 'retrieveUserInformation',
        });
      });

      test('should pass the error to onRequestError hooks', async () => {
        server.use(http.post(SOAP_ENDPOINT, handler));

        const { error, hookErrors } = await captureQueryError(SECURITY, requestOptions);

        expect(hookErrors).toEqual([error]);
        expect(hookErrors[0]).toBe(error);
      });
    });
  });

  describe.each([
    {
      subject: 'when looking up the WSDL URL fails',
      failures: WSDL_LOOKUP_FAILURES,
      url: WSDL_LOOKUP_URL,
      useHandler: (handler: HttpResponseResolver) => http.post(WSDL_LOOKUP_URL, handler),
      xsdEndpoint: undefined,
    },
    {
      subject: 'when downloading the WSDL archive fails',
      failures: WSDL_ARCHIVE_FAILURES,
      url: WSDL_ARCHIVE_URL,
      useHandler: (handler: HttpResponseResolver) => http.get(WSDL_ARCHIVE_URL, handler),
      xsdEndpoint: WSDL_ARCHIVE_URL,
    },
  ])('$subject', ({ failures, url, useHandler, xsdEndpoint }) => {
    describe.each(failures)('%s', (_, { handler, expectedError }) => {
      test(`should read "${expectedError.message}"`, async () => {
        server.use(useHandler(handler));

        const error = await captureWSDLError(SECURITY, xsdEndpoint);

        expect(error.message).toBe(expectedError.message);
      });

      test(`should report kind "${expectedError.kind}"`, async () => {
        server.use(useHandler(handler));

        const error = await captureWSDLError(SECURITY, xsdEndpoint);

        expect(error.kind).toBe(expectedError.kind);
      });

      test('should report the HTTP status, if any', async () => {
        server.use(useHandler(handler));

        const error = await captureWSDLError(SECURITY, xsdEndpoint);

        expect(error.httpStatus).toBe(expectedError.httpStatus);
      });

      test('should hold the body of the response, if any', async () => {
        server.use(useHandler(handler));

        const error = await captureWSDLError(SECURITY, xsdEndpoint);

        expect(error.body).toBe(expectedError.body);
      });

      test('should report the URL', async () => {
        server.use(useHandler(handler));

        const error = await captureWSDLError(SECURITY, xsdEndpoint);

        expect(error.url).toBe(url);
      });

      test('should name neither a service nor a query', async () => {
        server.use(useHandler(handler));

        const error = await captureWSDLError(SECURITY, xsdEndpoint);

        expect(error.service).toBeUndefined();
        expect(error.query).toBeUndefined();
      });
    });
  });

  /**
   * The WSDL URL lookup only happens without `xsdEndpoint`, which API Gateway
   * security requires: only certificate security goes through it.
   */
  const SECURITY_CASES: Array<
    [string, { security: Security; wsdlLookupFailures: Array<[string, Failure]> }]
  > = [
    ['API Gateway', { security: SECURITIES['API Gateway'], wsdlLookupFailures: [] }],
    ['PFX', { security: SECURITIES.PFX, wsdlLookupFailures: WSDL_LOOKUP_FAILURES }],
    ['PEM', { security: SECURITIES.PEM, wsdlLookupFailures: WSDL_LOOKUP_FAILURES }],
  ];

  describe.each(SECURITY_CASES)('with %s security', (_, { security, wsdlLookupFailures }) => {
    test.each(QUERY_FAILURES)(
      'should not expose any credential when a query fails, %s',
      async (_title, { handler, requestOptions }) => {
        server.use(http.post(SOAP_ENDPOINT, handler));

        const { error } = await captureQueryError(security, requestOptions);

        expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      },
    );

    test.each(WSDL_ARCHIVE_FAILURES)(
      'should not expose any credential when downloading the WSDL archive fails, %s',
      async (_title, { handler }) => {
        server.use(http.get(WSDL_ARCHIVE_URL, handler));

        const error = await captureWSDLError(security, WSDL_ARCHIVE_URL);

        expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      },
    );

    test.each(wsdlLookupFailures)(
      'should not expose any credential when looking up the WSDL URL fails, %s',
      async (_title, { handler }) => {
        server.use(http.post(WSDL_LOOKUP_URL, handler));

        const error = await captureWSDLError(security);

        expect(findCredentialPaths(error, security, [URL_PASSWORD])).toEqual([]);
      },
    );
  });
});
