import { inspect } from 'util';
import { makeFlowClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { AssertionError } from 'chai';
import { describe, test, expect } from 'vitest';
import { shouldUseRealB2BConnection } from '../../tests/utils';

describe('retrieveOTMVPlan', async () => {
  const Flow = await makeFlowClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('LFERMS', async () => {
    try {
      const res = await Flow.retrieveOTMVPlan({
        dataset: { type: 'OPERATIONAL' },
        day: moment.utc().toDate(),
        otmvsWithDuration: {
          item: [{ trafficVolume: 'LFERMS' }],
        },
      });

      expect(res.data).toBeDefined();
      expect(res.data.plans.planCutOffReached).toEqual(expect.any(Boolean));
      expect(res.data.plans.tvsOTMVs.item.length).toEqual(1);
      expect(res.data.plans.tvsOTMVs.item[0]).toEqual({
        key: 'LFERMS',
        value: {
          item: expect.any(Array),
        },
      });

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
      if (err instanceof AssertionError) {
        throw err;
      }

      console.log(inspect(err, { depth: 4 }));
      throw err;
    }
  });
});
