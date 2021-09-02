import { inspect } from 'util';
import { makeFlowClient } from '..';
import moment from 'moment';
// @ts-ignore
import b2bOptions from '../../tests/options';
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

describe('queryHotspots', () => {
  // Not authorised with this certificate in OPS
  conditionalTest('List all hotspots', async () => {
    try {
      const res = await Flow.queryHotspots({
        dataset: { type: 'OPERATIONAL' },
        day: new Date(),
        trafficVolume: 'LFRMZI',
        hotspotKind: 'PROBLEM',
      });

      !process.env.CI && console.log(inspect(res, { depth: null }));
    } catch (err) {
      if (err.status === 'NOT_AUTHORISED') {
        console.warn('Test cancelled, NOT_AUTHORIZED');
        return;
      }

      console.log(inspect(err, { depth: null }));

      throw err;
    }
  });
});
