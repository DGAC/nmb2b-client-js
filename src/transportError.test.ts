import { delay, http, HttpResponse } from 'msw';
import { randomUUID } from 'node:crypto';
import { assert, describe, expect, test } from 'vitest';
import { TEST_B2B_OPTIONS } from '../tests/options.ts';
import { createTestSecurities, findCredentialPaths } from '../tests/utils/credentials.ts';
import { MOCK_B2B_ENDPOINT } from '../tests/constants.ts';
import { server, SOAP_ENDPOINT } from '../tests/utils/msw.ts';
import type { Security } from './security.ts';
import { createGeneralInformationClient, createHook, NMB2BTransportError } from './index.ts';

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

const SECURITIES = createTestSecurities();

/** A password put in a configured URL, unique to this run. */
const URL_PASSWORD = `test-url-password-${randomUUID()}`;

function withCredentialsInUrl(url: string): string {
  const parsed = new URL(url);
  parsed.username = 'test-url-user';
  parsed.password = URL_PASSWORD;
  return parsed.toString();
}

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
});
