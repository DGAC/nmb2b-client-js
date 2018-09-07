/* @flow */
import { inspect } from 'util';
import { dateFormat, timeFormat } from '../utils/timeFormats';
import moment from 'moment';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

import { type B2BClient } from '../';
const b2bClient: B2BClient = global.__B2B_CLIENT__;
const conditionalTest = b2bClient ? test : test.skip;
const xconditionalTest = xtest;

describe('queryHotspots', () => {


  // Not authorised with this certificate
  xconditionalTest('List all hotspots', async () => {
    const { Flow } = b2bClient;

    try {
      const res = await Flow.queryHotspots({
        dataset: { type: 'OPERATIONAL' },
        day: new Date(),
        trafficVolume: 'EGLLARR',
        hotspotKind: 'PROBLEM',
      });

      console.log(res);
    } catch (err) {
      console.log(inspect(err, { depth: null }));
      throw err;
    }
  });
});
