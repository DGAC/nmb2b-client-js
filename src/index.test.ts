import { assert, describe, expect, test } from 'vitest';
import b2bOptions from '../tests/options.js';
import { shouldUseRealB2BConnection } from '../tests/utils.js';
import {
  createAirspaceClient,
  createB2BClient,
  createFlightClient,
  createFlowClient,
  createGeneralInformationClient,
} from './index.js';

describe('Main API', () => {
  test(createB2BClient, async () => {
    const b2bClient = await createB2BClient(b2bOptions);
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
    const res = await fn(b2bOptions);
    expect(res).toBeDefined();
    expect(res.config).toEqual(expect.objectContaining(b2bOptions));
  });

  describe('soap query options', () => {
    describe('timeout', () => {
      test.runIf(shouldUseRealB2BConnection)(
        'should allow a timeout option to be set on methods',
        async () => {
          const client = await createGeneralInformationClient(b2bOptions);

          try {
            await client.retrieveUserInformation({}, { timeout: 10 });
            expect.unreachable('This query should timeout');
          } catch (err) {
            assert.instanceOf(err, Error);
            expect(err.message).toMatch(/timeout/i);
          }
        },
      );
    });
  });
});
