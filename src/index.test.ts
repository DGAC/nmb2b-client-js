import { delay, http, HttpResponse } from 'msw';
import { assert, describe, expect, test } from 'vitest';
import { TEST_B2B_CONFIG } from '../tests/options.js';
import { server, SOAP_ENDPOINT } from '../tests/utils/msw.js';
import {
  createAirspaceClient,
  createB2BClient,
  createFlightClient,
  createFlowClient,
  createGeneralInformationClient,
} from './index.js';

describe('Main API', () => {
  test(createB2BClient, async () => {
    const b2bClient = await createB2BClient(TEST_B2B_CONFIG);
    expect(b2bClient).toBeDefined();
    expect(b2bClient.Airspace).toBeDefined();
    expect(b2bClient.Flight).toBeDefined();
    expect(b2bClient.Flow).toBeDefined();
    expect(b2bClient.GeneralInformation).toBeDefined();
  });

  test.each([
    createFlowClient,
    createFlightClient,
    createAirspaceClient,
    createGeneralInformationClient,
  ])('%O', async (fn) => {
    const res = await fn(TEST_B2B_CONFIG);
    expect(res).toBeDefined();
    expect(res.config).toEqual(expect.objectContaining(TEST_B2B_CONFIG));
  });

  describe('soap query options', () => {
    describe('timeout', () => {
      test('should allow a timeout option to be set on methods', async () => {
        server.use(
          http.post(SOAP_ENDPOINT, async () => {
            await delay(100);
            return HttpResponse.xml('<foo/>');
          }),
        );

        const client = await createGeneralInformationClient(TEST_B2B_CONFIG);

        try {
          await client.retrieveUserInformation({}, { timeout: 10 });
          expect.unreachable('This query should timeout');
        } catch (err) {
          assert.instanceOf(err, Error);
          expect(err.message).toMatch(/timeout/i);
        }
      });
    });
  });
});
