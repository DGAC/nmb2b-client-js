import { inspect } from 'util';
import { makeFlowClient, B2BClient } from '..';
import moment from 'moment';
// @ts-ignore
import b2bOptions from '../../tests/options';
import { Result as CapacityPlanRetrievalResult } from './retrieveCapacityPlan';
import { FlowService } from '.';
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
  conditionalTest('LFERMS', async () => {
    try {
      const res: CapacityPlanRetrievalResult = await Flow.retrieveCapacityPlan({
        dataset: { type: 'OPERATIONAL' },
        day: moment.utc().toDate(),
        trafficVolumes: {
          item: ['LFERMS', 'LFBBDX'],
        },
      });

      expect(res.data).toBeDefined();
      // console.log(inspect(res.data, { depth: null }));
    } catch (err) {
      console.log(inspect(err, { depth: 4 }));
      throw err;
    }
  });
});
