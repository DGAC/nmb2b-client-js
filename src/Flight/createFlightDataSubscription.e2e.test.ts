import { describe, expect, test } from 'vitest';
import { TEST_B2B_OPTIONS } from '../../tests/options.ts';
import {
  shouldCreateSubscriptions,
  shouldUseRealB2BConnection,
} from '../../tests/utils.ts';
import { createCommonClient, createFlightClient } from '../index.ts';

describe('createFlightDataSubscription', async () => {
  const [Common, Flight] = await Promise.all([
    createCommonClient(TEST_B2B_OPTIONS),
    createFlightClient(TEST_B2B_OPTIONS),
  ]);

  test.runIf(shouldUseRealB2BConnection && shouldCreateSubscriptions)(
    'create subscription',
    async () => {
      let subscriptionUuid: string | undefined;

      try {
        const res = await Flight.createFlightDataSubscription({
          payloadConfiguration: {
            flightFields: { item: ['iataFlightDesignator'] },
            concernedUnits: true,
          },
        }).catch(() => {
          expect.unreachable();
        });

        subscriptionUuid = res.data.subscription.summary.uuid;
      } finally {
        if (subscriptionUuid) {
          await Common.deleteSubscription({ uuid: subscriptionUuid });
        }
      }
    },
  );
});
