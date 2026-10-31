import { fromPartial } from '@total-typescript/shoehorn';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { assert, describe, expect, test } from 'vitest';

import {
  findCredentialPaths,
  URL_PASSWORD,
  withCredentialsInUrl,
} from '../../tests/utils/credentials.ts';
import { NMB2BTransportError } from './NMB2BTransportError.ts';
import { sanitizeError } from './sanitizeError.ts';

describe(sanitizeError, () => {
  const REQUEST_URL = 'https://fake-b2b.test/soap';
  const CONTEXT_URL = 'https://fake-b2b.test/context';
  const SECURITY = { apiKeyId: 'test-api-key-id', apiSecretKey: 'test-api-secret-key' };

  /**
   * What `soap` throws when a response was received but is not a usable reply.
   */
  function createSoapResponseError({
    status,
    body,
    root,
    message = 'thrown by soap',
    url = REQUEST_URL,
  }: {
    status: number;
    body: string;
    root?: unknown;
    message?: string;
    url?: string | null;
  }) {
    return Object.assign(new Error(message), {
      response: { status, config: { url: url ?? undefined } },
      body,
      root,
    });
  }

  describe('with what soap throws on a response', () => {
    describe.each([
      [
        'with a 504, with a JSON body',
        {
          failure: { status: 504, body: '{"message": "Endpoint request timed out"}' },
          expectedError: { kind: 'http', message: 'HTTP status 504' },
        },
      ],
      [
        'with a 502, with an HTML page',
        {
          failure: { status: 502, body: '<p>Bad Gateway</p>' },
          expectedError: { kind: 'http', message: 'HTTP status 502' },
        },
      ],
      [
        'with a 504, with an empty body',
        {
          failure: { status: 504, body: '' },
          expectedError: { kind: 'http', message: 'HTTP status 504' },
        },
      ],
      [
        'with a 400, with a body that is not XML',
        {
          failure: { status: 400, body: 'not xml at all' },
          expectedError: { kind: 'http', message: 'HTTP status 400' },
        },
      ],
      [
        'with a 200, with a body that is not XML',
        {
          failure: { status: 200, body: 'not xml at all' },
          expectedError: { kind: 'parse', message: 'Invalid response body (HTTP status 200)' },
        },
      ],
      [
        'with a 302, with an HTML page',
        {
          failure: { status: 302, body: '<html><body>Moved</body></html>' },
          expectedError: { kind: 'parse', message: 'Invalid response body (HTTP status 302)' },
        },
      ],
      [
        'with a 500, with a SOAP fault',
        {
          failure: {
            status: 500,
            body: '<fault/>',
            root: { Envelope: {} },
            message: 'S:Server: Internal failure',
          },
          expectedError: { kind: 'fault', message: 'S:Server: Internal failure' },
        },
      ],
      [
        'with a 200, with a SOAP fault',
        {
          failure: {
            status: 200,
            body: '<fault/>',
            root: { Envelope: {} },
            message: 'S:Server: Internal failure',
          },
          expectedError: { kind: 'fault', message: 'S:Server: Internal failure' },
        },
      ],
    ])('%s', (_, { failure, expectedError }) => {
      test(`should read "${expectedError.message}"`, () => {
        const error = sanitizeError(createSoapResponseError(failure), {});

        expect(error.message).toBe(expectedError.message);
      });

      test(`should report kind "${expectedError.kind}"`, () => {
        const error = sanitizeError(createSoapResponseError(failure), {});
        assert.instanceOf(error, NMB2BTransportError);

        expect(error.kind).toBe(expectedError.kind);
      });

      test(`should report HTTP status ${failure.status}`, () => {
        const error = sanitizeError(createSoapResponseError(failure), {});
        assert.instanceOf(error, NMB2BTransportError);

        expect(error.httpStatus).toBe(failure.status);
      });

      test('should hold the body', () => {
        const error = sanitizeError(createSoapResponseError(failure), {});
        assert.instanceOf(error, NMB2BTransportError);

        expect(error.body).toBe(failure.body);
      });
    });

    test('should not truncate a large body', () => {
      const body = `<html><body>${'Bad Gateway '.repeat(10_000)}</body></html>`;

      const error = sanitizeError(createSoapResponseError({ status: 502, body }), {});
      assert.instanceOf(error, NMB2BTransportError);

      expect(error.body).toBe(body);
    });

    test('should put the prefix before the message', () => {
      const error = sanitizeError(createSoapResponseError({ status: 504, body: '' }), {
        messagePrefix: 'prefix: ',
      });

      expect(error.message).toBe('prefix: HTTP status 504');
    });

    test('should report the URL of the failure rather than that of the context', () => {
      const error = sanitizeError(
        createSoapResponseError({ status: 504, body: '', url: REQUEST_URL }),
        { url: CONTEXT_URL },
      );
      assert.instanceOf(error, NMB2BTransportError);

      expect(error.url).toBe(REQUEST_URL);
    });

    test('should fall back on the URL of the context', () => {
      const error = sanitizeError(createSoapResponseError({ status: 504, body: '', url: null }), {
        url: CONTEXT_URL,
      });
      assert.instanceOf(error, NMB2BTransportError);

      expect(error.url).toBe(CONTEXT_URL);
    });

    test('should name the service of the context', () => {
      const error = sanitizeError(createSoapResponseError({ status: 504, body: '' }), {
        service: 'GeneralInformation',
      });
      assert.instanceOf(error, NMB2BTransportError);

      expect(error.service).toBe('GeneralInformation');
    });

    test('should name the query of the context', () => {
      const error = sanitizeError(createSoapResponseError({ status: 504, body: '' }), {
        query: 'retrieveUserInformation',
      });
      assert.instanceOf(error, NMB2BTransportError);

      expect(error.query).toBe('retrieveUserInformation');
    });

    test('should not keep the failure as its cause', () => {
      const error = sanitizeError(createSoapResponseError({ status: 504, body: '' }), {});

      expect(error.cause).toBeUndefined();
    });

    test('should not expose any credential', () => {
      const failure = Object.assign(
        createSoapResponseError({
          status: 504,
          body: '',
          url: withCredentialsInUrl(REQUEST_URL),
        }),
        {
          config: { auth: SECURITY },
        },
      );

      const error = sanitizeError(failure, {});
      assert.instanceOf(error, NMB2BTransportError);

      expect(findCredentialPaths(error, SECURITY, [URL_PASSWORD])).toEqual([]);
    });
  });

  describe('with an axios error', () => {
    const CONFIG = fromPartial<InternalAxiosRequestConfig>({
      url: withCredentialsInUrl(REQUEST_URL),
      auth: { username: SECURITY.apiKeyId, password: SECURITY.apiSecretKey },
    });

    describe('without a response', () => {
      function createFailure({
        message = 'Network Error',
        code = 'ERR_NETWORK',
      }: { message?: string; code?: string } = {}) {
        return new AxiosError(message, code, CONFIG);
      }

      test('should keep its message', () => {
        const error = sanitizeError(createFailure({ message: 'Network Error' }), {});

        expect(error.message).toBe('Network Error');
      });

      test('should report kind "network"', () => {
        const error = sanitizeError(createFailure(), {});
        assert.instanceOf(error, NMB2BTransportError);

        expect(error.kind).toBe('network');
      });

      test('should report its code', () => {
        const error = sanitizeError(createFailure({ code: 'ERR_NETWORK' }), {});
        assert.instanceOf(error, NMB2BTransportError);

        expect(error.code).toBe('ERR_NETWORK');
      });

      test('should report no HTTP status', () => {
        const error = sanitizeError(createFailure(), {});
        assert.instanceOf(error, NMB2BTransportError);

        expect(error.httpStatus).toBeUndefined();
      });

      test('should report its URL, without credentials', () => {
        const error = sanitizeError(createFailure(), {});
        assert.instanceOf(error, NMB2BTransportError);

        expect(error.url).toBe(REQUEST_URL);
      });

      test('should fall back on the URL of the context', () => {
        const error = sanitizeError(new AxiosError('Network Error', 'ERR_NETWORK'), {
          url: CONTEXT_URL,
        });
        assert.instanceOf(error, NMB2BTransportError);

        expect(error.url).toBe(CONTEXT_URL);
      });

      test('should not expose any credential', () => {
        const error = sanitizeError(createFailure(), {});
        assert.instanceOf(error, NMB2BTransportError);

        expect(findCredentialPaths(error, SECURITY, [URL_PASSWORD])).toEqual([]);
      });
    });

    describe('with a response', () => {
      function createFailure({
        message = 'Request failed with status code 503',
        status = 503,
        data = '<p>Unavailable</p>',
      }: { message?: string; status?: number; data?: unknown } = {}) {
        return new AxiosError(
          message,
          'ERR_BAD_RESPONSE',
          CONFIG,
          undefined,
          fromPartial<AxiosResponse>({ status, data, config: CONFIG }),
        );
      }

      test('should keep its message', () => {
        const error = sanitizeError(
          createFailure({ message: 'Request failed with status code 503' }),
          {},
        );

        expect(error.message).toBe('Request failed with status code 503');
      });

      test('should report kind "http"', () => {
        const error = sanitizeError(createFailure(), {});
        assert.instanceOf(error, NMB2BTransportError);

        expect(error.kind).toBe('http');
      });

      test('should report HTTP status 503', () => {
        const error = sanitizeError(createFailure({ status: 503 }), {});
        assert.instanceOf(error, NMB2BTransportError);

        expect(error.httpStatus).toBe(503);
      });

      test('should hold a text body', () => {
        const error = sanitizeError(createFailure({ data: '<p>Unavailable</p>' }), {});
        assert.instanceOf(error, NMB2BTransportError);

        expect(error.body).toBe('<p>Unavailable</p>');
      });

      test('should drop a body that is not text', () => {
        const error = sanitizeError(createFailure({ data: { message: 'Unavailable' } }), {});
        assert.instanceOf(error, NMB2BTransportError);

        expect(error.body).toBeUndefined();
      });

      test('should not expose any credential', () => {
        const error = sanitizeError(createFailure(), {});
        assert.instanceOf(error, NMB2BTransportError);

        expect(findCredentialPaths(error, SECURITY, [URL_PASSWORD])).toEqual([]);
      });
    });
  });

  describe('with another failure, of a kind given by the context', () => {
    function createFailure({
      message = 'read ECONNRESET',
      code = 'ECONNRESET',
    }: { message?: string; code?: string } = {}) {
      return Object.assign(new Error(message), { code });
    }

    test('should keep its message', () => {
      const error = sanitizeError(createFailure({ message: 'read ECONNRESET' }), {
        kind: 'network',
      });

      expect(error.message).toBe('read ECONNRESET');
    });

    test('should report the kind of the context', () => {
      const error = sanitizeError(createFailure(), { kind: 'network' });
      assert.instanceOf(error, NMB2BTransportError);

      expect(error.kind).toBe('network');
    });

    test('should report its system code', () => {
      const error = sanitizeError(createFailure({ code: 'ECONNRESET' }), { kind: 'network' });
      assert.instanceOf(error, NMB2BTransportError);

      expect(error.code).toBe('ECONNRESET');
    });

    test('should report the URL of the context', () => {
      const error = sanitizeError(createFailure(), { kind: 'network', url: CONTEXT_URL });
      assert.instanceOf(error, NMB2BTransportError);

      expect(error.url).toBe(CONTEXT_URL);
    });
  });

  describe('with another failure, of no known kind', () => {
    test('should return an Error that is not a transport error', () => {
      const error = sanitizeError(new Error('a bug'), {});

      expect(error).not.toBeInstanceOf(NMB2BTransportError);
    });

    test('should keep its message', () => {
      const error = sanitizeError(new Error('a bug'), {});

      expect(error.message).toBe('a bug');
    });

    test('should read "Unknown error" for what is not an Error', () => {
      const error = sanitizeError('not an error', {});

      expect(error.message).toBe('Unknown error');
    });

    test('should not keep the failure as its cause', () => {
      const error = sanitizeError(new Error('a bug'), {});

      expect(error.cause).toBeUndefined();
    });
  });
});
