import { add, startOfHour, sub } from 'date-fns';
import { inspect } from 'util';
import { describe, expect, test } from 'vitest';
import b2bOptions from '../../tests/options.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';
import { NMB2BError, createFlowClient } from '../index.js';

describe('queryTrafficCountsByAirspace', async () => {
  const Flow = await createFlowClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('LFEE5R, aggregated', async () => {
    try {
      const res = await Flow.queryTrafficCountsByAirspace({
        dataset: { type: 'OPERATIONAL' },
        trafficWindow: {
          wef: startOfHour(sub(new Date(), { hours: 1 })),
          unt: startOfHour(add(new Date(), { hours: 1 })),
        },
        includeProposalFlights: false,
        includeForecastFlights: false,
        trafficTypes: { item: ['LOAD', 'DEMAND', 'REGULATED_DEMAND'] },
        countsInterval: {
          duration: 20 * 60,
          step: 20 * 60,
        },
        subTotalComputeMode: 'NO_SUB_TOTALS',
        airspace: 'LFEE5R',
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
                value: { totalCounts: expect.any(Number) },
              }),
              expect.objectContaining({
                key: 'DEMAND',
                value: { totalCounts: expect.any(Number) },
              }),
              expect.objectContaining({
                key: 'REGULATED_DEMAND',
                value: { totalCounts: expect.any(Number) },
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
