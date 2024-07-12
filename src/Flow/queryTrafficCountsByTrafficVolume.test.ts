import { inspect } from 'util';
import { describe, expect, test } from 'vitest';
import { NMB2BError, makeFlowClient } from '..';
import b2bOptions from '../../tests/options';
import { shouldUseRealB2BConnection } from '../../tests/utils';
import { add, startOfHour, sub } from 'date-fns';

describe('queryTrafficCountsByTrafficVolume', async () => {
  const Flow = await makeFlowClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('LFEE5R, aggregated', async () => {
    try {
      const res = await Flow.queryTrafficCountsByTrafficVolume({
        dataset: { type: 'OPERATIONAL' },
        trafficWindow: {
          wef: startOfHour(sub(new Date(), { hours: 1 })),
          unt: startOfHour(add(new Date(), { hours: 1 })),
        },
        includeProposalFlights: false,
        includeForecastFlights: false,
        trafficTypes: { item: ['LOAD'] },
        subTotalComputeMode: 'SUB_TOTALS_BY_TRAFFIC_TYPE',
        countsInterval: {
          duration: 20 * 60,
          step: 20 * 60,
        },
        trafficVolume: 'LFRMZI',
        calculationType: 'OCCUPANCY',
      });

      expect(res.data.counts).toBeDefined();

      const { counts } = res.data;
      expect(Array.isArray(counts?.item)).toBe(true);
      expect(counts?.item?.length).toBe(6);

      for (const item of counts?.item ?? []) {
        expect(item).toMatchObject({
          key: {
            wef: expect.any(Date),
            unt: expect.any(Date),
          },
          value: {
            item: expect.arrayContaining([
              expect.objectContaining({
                key: 'LOAD',
                value: {
                  totalCounts: expect.any(Number),
                  subTotalsCountsByTrafficType: {
                    item: expect.arrayContaining([
                      expect.objectContaining({
                        key: expect.any(String),
                        value: expect.any(Number),
                      }),
                    ]),
                  },
                },
              }),
            ]),
          },
        });
      }
    } catch (err) {
      if (err instanceof NMB2BError) {
        console.log(inspect(err, { depth: 4 }));
      }

      throw err;
    }
  });
});
