import { fromPartial } from '@total-typescript/shoehorn';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { assert, describe, expect, test } from 'vitest';

import { findCredentialPaths } from '../../tests/utils/credentials.ts';
import { NMB2BTransportError } from './NMB2BTransportError.ts';
import { sanitizeError } from './sanitizeError.ts';

describe(sanitizeError, () => {
  const RESPONSE_URL = 'https://fake-b2b.test/soap';
  const CONTEXT_URL = 'https://fake-b2b.test/context';
  const PASSWORD = 'url-password';
  const URL_WITH_CREDENTIALS = `https://user:${PASSWORD}@fake-b2b.test/soap`;
  const SECURITY = { apiKeyId: 'test-api-key-id', apiSecretKey: 'test-api-secret-key' };

  function captureTransportError(...args: Parameters<typeof sanitizeError>) {
    const error = sanitizeError(...args);

    assert.instanceOf(error, NMB2BTransportError);
    return error;
  }

  /**
   * What `soap` throws when a response was received but is not a usable reply.
   */
  function createSoapError({
    status,
    body,
    root,
    url = RESPONSE_URL,
  }: {
    status: number;
    body: string;
    root?: unknown;
    url?: string | null;
  }) {
    return Object.assign(new Error(root ? 'S:Server: Internal failure' : 'thrown by soap'), {
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
          failure: { status: 500, body: '<fault/>', root: { Envelope: {} } },
          expectedError: { kind: 'fault', message: 'S:Server: Internal failure' },
        },
      ],
      [
        'with a 200, with a SOAP fault',
        {
          failure: { status: 200, body: '<fault/>', root: { Envelope: {} } },
          expectedError: { kind: 'fault', message: 'S:Server: Internal failure' },
        },
      ],
    ])('%s', (_, { failure, expectedError }) => {
      test(`should read "${expectedError.message}"`, () => {
        const error = captureTransportError(createSoapError(failure), {});

        expect(error.message).toBe(expectedError.message);
      });

      test(`should report kind "${expectedError.kind}"`, () => {
        const error = captureTransportError(createSoapError(failure), {});

        expect(error.kind).toBe(expectedError.kind);
      });

      test(`should report HTTP status ${failure.status}`, () => {
        const error = captureTransportError(createSoapError(failure), {});

        expect(error.httpStatus).toBe(failure.status);
      });

      test('should hold the body', () => {
        const error = captureTransportError(createSoapError(failure), {});

        expect(error.body).toBe(failure.body);
      });
    });

    test('should not truncate a large body', () => {
      const body = `<html><body>${'Bad Gateway '.repeat(10_000)}</body></html>`;

      const error = captureTransportError(createSoapError({ status: 502, body }), {});

      expect(error.body).toBe(body);
    });

    test('should put the prefix before the message', () => {
      const error = captureTransportError(createSoapError({ status: 504, body: '' }), {
        messagePrefix: 'prefix: ',
      });

      expect(error.message).toBe('prefix: HTTP status 504');
    });

    test('should report the URL of the response rather than that of the context', () => {
      const error = captureTransportError(
        createSoapError({ status: 504, body: '', url: RESPONSE_URL }),
        { url: CONTEXT_URL },
      );

      expect(error.url).toBe(RESPONSE_URL);
    });

    test('should fall back on the URL of the context', () => {
      const error = captureTransportError(createSoapError({ status: 504, body: '', url: null }), {
        url: CONTEXT_URL,
      });

      expect(error.url).toBe(CONTEXT_URL);
    });

    test('should name the service and the query of the context', () => {
      const error = captureTransportError(createSoapError({ status: 504, body: '' }), {
        service: 'GeneralInformation',
        query: 'retrieveUserInformation',
      });

      expect(error).toMatchObject({
        service: 'GeneralInformation',
        query: 'retrieveUserInformation',
      });
    });

    test('should not keep the failure as its cause', () => {
      const error = captureTransportError(createSoapError({ status: 504, body: '' }), {});

      expect(error.cause).toBeUndefined();
    });

    test('should not expose any credential', () => {
      const failure = Object.assign(
        createSoapError({ status: 504, body: '', url: URL_WITH_CREDENTIALS }),
        {
          config: { auth: SECURITY },
        },
      );

      const error = captureTransportError(failure, {});

      expect(findCredentialPaths(error, SECURITY, [PASSWORD])).toEqual([]);
    });
  });

  describe('with an axios error', () => {
    const CONFIG = fromPartial<InternalAxiosRequestConfig>({
      url: URL_WITH_CREDENTIALS,
      auth: { username: SECURITY.apiKeyId, password: SECURITY.apiSecretKey },
    });

    describe('without a response', () => {
      const FAILURE = new AxiosError('Network Error', 'ERR_NETWORK', CONFIG);

      test('should keep its message', () => {
        const error = captureTransportError(FAILURE, {});

        expect(error.message).toBe('Network Error');
      });

      test('should report kind "network"', () => {
        const error = captureTransportError(FAILURE, {});

        expect(error.kind).toBe('network');
      });

      test('should report its code', () => {
        const error = captureTransportError(FAILURE, {});

        expect(error.code).toBe('ERR_NETWORK');
      });

      test('should report no HTTP status', () => {
        const error = captureTransportError(FAILURE, {});

        expect(error.httpStatus).toBeUndefined();
      });

      test('should report its URL, without credentials', () => {
        const error = captureTransportError(FAILURE, {});

        expect(error.url).toBe(RESPONSE_URL);
      });

      test('should fall back on the URL of the context', () => {
        const error = captureTransportError(new AxiosError('Network Error', 'ERR_NETWORK'), {
          url: CONTEXT_URL,
        });

        expect(error.url).toBe(CONTEXT_URL);
      });

      test('should not expose any credential', () => {
        const error = captureTransportError(FAILURE, {});

        expect(findCredentialPaths(error, SECURITY, [PASSWORD])).toEqual([]);
      });
    });

    describe('with a response', () => {
      function createFailure(data: unknown) {
        return new AxiosError(
          'Request failed with status code 503',
          'ERR_BAD_RESPONSE',
          CONFIG,
          undefined,
          fromPartial<AxiosResponse>({ status: 503, data, config: CONFIG }),
        );
      }

      test('should keep its message', () => {
        const error = captureTransportError(createFailure('<p>Unavailable</p>'), {});

        expect(error.message).toBe('Request failed with status code 503');
      });

      test('should report kind "http"', () => {
        const error = captureTransportError(createFailure('<p>Unavailable</p>'), {});

        expect(error.kind).toBe('http');
      });

      test('should report HTTP status 503', () => {
        const error = captureTransportError(createFailure('<p>Unavailable</p>'), {});

        expect(error.httpStatus).toBe(503);
      });

      test('should hold a text body', () => {
        const error = captureTransportError(createFailure('<p>Unavailable</p>'), {});

        expect(error.body).toBe('<p>Unavailable</p>');
      });

      test('should drop a body that is not text', () => {
        const error = captureTransportError(createFailure({ message: 'Unavailable' }), {});

        expect(error.body).toBeUndefined();
      });

      test('should not expose any credential', () => {
        const error = captureTransportError(createFailure('<p>Unavailable</p>'), {});

        expect(findCredentialPaths(error, SECURITY, [PASSWORD])).toEqual([]);
      });
    });
  });

  describe('with another failure, of a kind given by the context', () => {
    function createFailure() {
      return Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' });
    }

    test('should keep its message', () => {
      const error = captureTransportError(createFailure(), { kind: 'network' });

      expect(error.message).toBe('read ECONNRESET');
    });

    test('should report the kind of the context', () => {
      const error = captureTransportError(createFailure(), { kind: 'network' });

      expect(error.kind).toBe('network');
    });

    test('should report its system code', () => {
      const error = captureTransportError(createFailure(), { kind: 'network' });

      expect(error.code).toBe('ECONNRESET');
    });

    test('should report the URL of the context', () => {
      const error = captureTransportError(createFailure(), { kind: 'network', url: CONTEXT_URL });

      expect(error.url).toBe(CONTEXT_URL);
    });
  });

  describe('with another failure, of no known kind', () => {
    test('should return an Error that is not a transport error', () => {
      const error = sanitizeError(new Error('a bug'), {});

      expect(error).not.toBeInstanceOf(NMB2BTransportError);
    });

    test('should keep its message', () => {
      const error = sanitizeError(new Error('a bug'), { messagePrefix: 'prefix: ' });

      expect(error.message).toBe('prefix: a bug');
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
