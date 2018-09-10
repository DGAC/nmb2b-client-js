/* @flow */
import { inspect } from 'util';
import { makeFlowClient } from '../';
import moment from 'moment';
import b2bOptions from '../../tests/options';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const conditionalTest = global.__DISABLE_B2B_CONNECTIONS__ ? test.skip : test;
const xconditionalTest = xtest;

let Flow;
beforeAll(async () => {
  Flow = await makeFlowClient(b2bOptions);
});


describe('queryHotspots', () => {


  // Not authorised with this certificate
  xconditionalTest('List all hotspots', async () => {
    try {
      const res = await Flow.queryHotspots({
        dataset: { type: 'OPERATIONAL' },
        day: new Date(),
        trafficVolume: 'EGLLARR',
        hotspotKind: 'PROBLEM',
      });

      !process.env.CI && console.log(res);
    } catch (err) {
      console.log(inspect(err, { depth: null }));
      throw err;
    }
  });
});
