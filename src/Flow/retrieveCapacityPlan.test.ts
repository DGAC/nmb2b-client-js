import { inspect } from 'util';
import { NMB2BError, makeFlowClient } from '../index.js';
import b2bOptions from '../../tests/options.js';
import type { Result as CapacityPlanRetrievalResult } from './retrieveCapacityPlan.js';
import { describe, test, expect, assert } from 'vitest';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';

describe('retrieveCapacityPlan', async () => {
  const Flow = await makeFlowClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('LFERMS, LFBBDX', async () => {
    try {
      const res: CapacityPlanRetrievalResult = await Flow.retrieveCapacityPlan({
        dataset: { type: 'OPERATIONAL' },
        day: new Date(),
        trafficVolumes: {
          item: ['LFERMS', 'LFBBDX'],
        },
      });

      expect(res.data.plans).toBeDefined();
      assert(res.data.plans);

      expect(Array.isArray(res.data.plans.tvCapacities?.item)).toBe(true);
      assert(res.data.plans.tvCapacities?.item);

      for (const item of res.data.plans.tvCapacities.item) {
        expect(item).toEqual({
          key: expect.stringMatching(/^[A-Z0-9]+$/),
          value: expect.objectContaining({
            nmSchedule: {
              item: expect.any(Array),
            },
            clientSchedule: {
              item: expect.any(Array),
            },
          }),
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
