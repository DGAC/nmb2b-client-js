import { assert } from 'vitest';
import {
  defineFixture,
  expectSnapshot,
} from '../../../tests/utils/fixtures.ts';

/**
 * Fixture for testing queryFlightsByAirspace.
 */
export const nominal = defineFixture({
  service: 'Common',
  method: 'listSubscriptions',
})
  .describe('Nominal request to list subscriptions')
  .run(async (client) => {
    return await client.Common.listSubscriptions({
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
  })
  .test('should match snapshot', expectSnapshot())
  .test(
    'should return a non-empty list of subscriptions',
    ({ expect, result }) => {
      assert(
        result.data?.subscriptions?.item,
        'result.data.subscriptions.item should be defined',
      );

      const subscriptions = result.data.subscriptions.item;
      expect(subscriptions.length).toBeGreaterThan(0);

      for (const subscription of subscriptions) {
        /* oxlint-disable typescript/no-unsafe-assignment */
        expect(subscription).toEqual(
          expect.objectContaining({
            uuid: expect.any(String),
            creationDate: expect.any(Date),
            lastUpdatedOn: expect.any(Date),
          }),
        );
        /* oxlint-enable typescript/no-unsafe-assignment */
      }
    },
  );
