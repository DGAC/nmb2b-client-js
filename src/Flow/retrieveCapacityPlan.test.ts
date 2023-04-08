import { inspect } from 'util';
import { makeFlowClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { Result as CapacityPlanRetrievalResult } from './retrieveCapacityPlan';
import { FlowService } from '.';
import { AssertionError } from 'chai';
import { describe, test, expect } from 'vitest';
import { shouldUseRealB2BConnection } from '../../tests/utils';

describe('retrieveCapacityPlan', async () => {
  const Flow = await makeFlowClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('LFERMS, LFBBDX', async () => {
    try {
      const res: CapacityPlanRetrievalResult = await Flow.retrieveCapacityPlan({
        dataset: { type: 'OPERATIONAL' },
        day: moment.utc().toDate(),
        trafficVolumes: {
          item: ['LFERMS', 'LFBBDX'],
        },
      });

      expect(res.data.plans).toBeDefined();
      expect(Array.isArray(res.data.plans.tvCapacities.item)).toBe(true);
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
      if (err instanceof AssertionError) {
        throw err;
      }

      console.log(inspect(err, { depth: 4 }));
      throw err;
    }
  });
});
