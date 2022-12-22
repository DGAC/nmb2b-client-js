import { inspect } from 'util';
import { makeFlowClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { Result as OTMVRetrievalResult } from './retrieveOTMVPlan';
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

describe('retrieveOTMVPlan', () => {
  conditionalTest('LFERMS', async () => {
    try {
      const res: OTMVRetrievalResult = await Flow.retrieveOTMVPlan({
        dataset: { type: 'OPERATIONAL' },
        day: moment.utc().toDate(),
        otmvsWithDuration: { item: [{ trafficVolume: 'LFERMS' }] },
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
      if (err instanceof JestAssertionError) {
        throw err;
      }

      console.log(inspect(err, { depth: 4 }));
      throw err;
    }
  });
});
