import { http, HttpResponse } from 'msw';
import { assert, describe, expect, test } from 'vitest';

import { createTestSecurities } from '../../../tests/utils/credentials.ts';
import { server } from '../../../tests/utils/msw.ts';
import { getSoapEndpoint } from '../../config.ts';
import { NMB2BTransportError } from '../NMB2BTransportError.ts';
import { getWSDLDownloadURL } from './getWSDLDownloadURL.ts';

describe(getWSDLDownloadURL, () => {
  const flavour = 'PREOPS';
  const url = getSoapEndpoint({ flavour });

  /**
   * Looks up the URL, which must fail with a transport error.
   */
  async function captureTransportError() {
    const error = await getWSDLDownloadURL({
      flavour,
      security: createTestSecurities().PFX,
    }).then(
      () => expect.unreachable('getWSDLDownloadURL() should have thrown an error'),
      (err: unknown) => err,
    );

    assert.instanceOf(error, NMB2BTransportError);
    return error;
  }

  describe('when the reply holds no WSDL file', () => {
    const REPLY_BODY = '<reply/>';

    function createReplyHandler() {
      return () => HttpResponse.xml(REPLY_BODY);
    }

    test('should read "Could not extract WSDL tarball file from B2B response"', async () => {
      server.use(http.post(url, createReplyHandler()));

      const error = await captureTransportError();

      expect(error.message).toBe('Could not extract WSDL tarball file from B2B response');
    });

    test('should report kind "parse"', async () => {
      server.use(http.post(url, createReplyHandler()));

      const error = await captureTransportError();

      expect(error.kind).toBe('parse');
    });

    test('should report HTTP status 200', async () => {
      server.use(http.post(url, createReplyHandler()));

      const error = await captureTransportError();

      expect(error.httpStatus).toBe(200);
    });

    test('should report the URL', async () => {
      server.use(http.post(url, createReplyHandler()));

      const error = await captureTransportError();

      expect(error.url).toBe(url);
    });

    test('should hold the body of the reply', async () => {
      server.use(http.post(url, createReplyHandler()));

      const error = await captureTransportError();

      expect(error.body).toBe(REPLY_BODY);
    });
  });
});
