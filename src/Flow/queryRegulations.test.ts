import { AssertionError } from 'chai';
import moment from 'moment';
import { inspect } from 'util';
import { describe, expect, test } from 'vitest';
import { makeFlowClient } from '..';
import b2bOptions from '../../tests/options';
import { shouldUseRealB2BConnection } from '../../tests/utils';

import type { RegulationListReply } from './queryRegulations';

describe('queryRegulations', async () => {
  const Flow = await makeFlowClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('List all regulations', async () => {
    try {
      const res: RegulationListReply = await Flow.queryRegulations({
        dataset: { type: 'OPERATIONAL' },
        queryPeriod: {
          wef: moment.utc().subtract(10, 'hour').startOf('hour').toDate(),
          unt: moment.utc().add(10, 'hour').startOf('hour').toDate(),
        },
        requestedRegulationFields: {
          item: [
            'applicability',
            'location',
            'reason',
            'linkedRegulations',
            'scenarioReference',
          ],
        },
      });

      const items = res.data.regulations.item;

      expect(items).toBeDefined();
      expect(items.length).toBeGreaterThanOrEqual(1);

      for (const item of items) {
        expect(item.regulationId).toBeDefined();
        if (!item.location) {
          return;
        }

        const location = item.protectedLocation || item.location;

        if ('referenceLocation-ReferenceLocationAirspace' in location) {
          expect(
            location['referenceLocation-ReferenceLocationAirspace'],
          ).toMatchObject({
            type: 'AIRSPACE',
            id: expect.any(String),
          });
        } else if ('referenceLocation-ReferenceLocationAerodrome' in location) {
          expect(
            location['referenceLocation-ReferenceLocationAerodrome'],
          ).toMatchObject({
            type: 'AERODROME',
            id: expect.any(String),
          });
        }
      }
    } catch (err) {
      if (err instanceof AssertionError) {
        throw err;
      }

      console.log(inspect(err, { depth: 4 }));
      throw err;
    }
  });
});
