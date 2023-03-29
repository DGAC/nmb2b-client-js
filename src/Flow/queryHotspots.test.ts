import { inspect } from 'util';
import { makeFlowClient } from '..';
import b2bOptions from '../../tests/options';
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

      // TODO: Write proper test
    } catch (err) {
      if (err instanceof JestAssertionError) {
        throw err;
      }

      if (err.status === 'NOT_AUTHORISED') {
        console.warn('Test cancelled, NOT_AUTHORIZED');
        return;
      }

      if (err.status === 'SERVICE_UNAVAILABLE') {
        console.warn('Test cancelled, SERVICE_UNAVAILABLE');
        return;
      }

      console.log(inspect(err, { depth: 4 }));

      throw err;
    }
  });
});
