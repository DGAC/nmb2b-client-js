import { inspect } from 'util';
import { makeFlowClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { Result as CapacityPlanRetrievalResult } from './retrieveCapacityPlan';
import { FlowService } from '.';
import { JestAssertionError } from 'expect';
jest.setTimeout(20000);

const conditionalTest = (global as any).__DISABLE_B2B_CONNECTIONS__
  ? test.skip
  : test;
const xconditionalTest = xtest;

let Flow: FlowService;
beforeAll(async () => {
  Flow = await makeFlowClient(b2bOptions);
});

describe('retrieveCapacityPlan', () => {
  conditionalTest('LFERMS, LFBBDX', async () => {
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
      if (err instanceof JestAssertionError) {
        throw err;
      }

      console.log(inspect(err, { depth: 4 }));
      throw err;
    }
  });
});
