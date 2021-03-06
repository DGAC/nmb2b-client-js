import { inspect } from 'util';
import { makeFlowClient, B2BClient } from '..';
import moment from 'moment';
// @ts-ignore
import b2bOptions from '../../tests/options';
import { Result as OTMVRetrievalResult } from './retrieveOTMVPlan';
import { FlowService } from '.';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

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
      // console.log(inspect(res.data, { depth: null }));
    } catch (err) {
      console.log(inspect(err, { depth: null }));
      throw err;
    }
  });
});
