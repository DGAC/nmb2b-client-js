import { inspect } from 'util';
import { assert, describe, expect, test } from 'vitest';
import b2bOptions from '../../tests/options.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';
import { NMB2BError, createFlowClient } from '../index.js';

describe('retrieveOTMVPlan', async () => {
  const Flow = await createFlowClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('LFERMS', async () => {
    try {
      const res = await Flow.retrieveOTMVPlan({
        dataset: { type: 'OPERATIONAL' },
        day: new Date(),
        otmvsWithDuration: {
          item: [{ trafficVolume: 'LFERMS' }],
        },
      });

      expect(res.data).toBeDefined();
      expect(res.data.plans.planCutOffReached).toEqual(expect.any(Boolean));
      expect(res.data.plans.tvsOTMVs?.item?.length).toEqual(1);
      expect(res.data.plans.tvsOTMVs?.item?.[0]).toEqual({
        key: 'LFERMS',
        value: {
          item: expect.any(Array),
        },
      });

      assert(res.data.plans.tvsOTMVs?.item?.[0]?.value?.item);

      for (const otmvPlan of res.data.plans.tvsOTMVs.item[0].value.item) {
        expect(otmvPlan).toEqual({
          key: expect.any(Number),
          value: {
            nmSchedule: expect.any(Object),
            clientSchedule: expect.any(Object),
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
