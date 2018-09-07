/* @flow */
import { inspect } from 'util';
import moment from 'moment';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

import { type B2BClient } from '../';
const b2bClient: B2BClient = global.__B2B_CLIENT__;
const conditionalTest = b2bClient ? test : test.skip;

import { type Result as OTMVRetrievalResult } from './retrieveOTMVPlan';

describe('retrieveOTMVPlan', () => {
  conditionalTest('LFERMS', async () => {
    const { Flow } = b2bClient;

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
