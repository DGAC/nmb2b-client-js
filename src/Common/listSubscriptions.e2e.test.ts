import { describe, expect, test } from 'vitest';
import { TEST_B2B_OPTIONS } from '../../tests/options.ts';
import { shouldUseRealB2BConnection } from '../../tests/utils.ts';
import { NMB2BError, createCommonClient } from '../index.ts';

describe('listSubscriptions', async () => {
  const commonClient = await createCommonClient(TEST_B2B_OPTIONS);

  test.runIf(shouldUseRealB2BConnection)(
    'should list subscriptions',
    async () => {
      try {
        const res = await commonClient.listSubscriptions({
          states: {
            item: [
              'ACTIVE',
              'PAUSED',
              'SUSPENDED_ACTIVE',
              'SUSPENDED_PAUSED',
              'DELETED',
            ],
          },
        });

        const subscriptions = res.data?.subscriptions;
        expect(subscriptions).toBeDefined();

        if (subscriptions?.item) {
          for (const subscription of subscriptions.item) {
            expect(subscription).toEqual(
              expect.objectContaining({
                uuid: expect.any(String),
                creationDate: expect.any(Date),
                lastUpdatedOn: expect.any(Date),
              }),
            );
          }
        }
      } catch (err) {
        if (err instanceof NMB2BError) {
          console.dir(err, { depth: null });
        }

        throw err;
      }
    },
  );
});
