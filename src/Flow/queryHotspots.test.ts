import { inspect } from 'util';
import { makeFlowClient, NMB2BError } from '../index.js';
import b2bOptions from '../../tests/options.js';
import { describe, test } from 'vitest';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';

describe('queryHotspots', async () => {
  const Flow = await makeFlowClient(b2bOptions);

  // Not authorised with this certificate in OPS
  test.runIf(shouldUseRealB2BConnection)('List all hotspots', async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const res = await Flow.queryHotspots({
        dataset: { type: 'OPERATIONAL' },
        day: new Date(),
        trafficVolume: 'LFRMZI',
        hotspotKind: 'PROBLEM',
      });

      // TODO: Write proper test
    } catch (err) {
      if (err instanceof NMB2BError) {
        console.log(inspect(err, { depth: 4 }));

        if (err.status === 'NOT_AUTHORISED') {
          console.warn('Test cancelled, NOT_AUTHORIZED');
          return;
        }

        if (err.status === 'SERVICE_UNAVAILABLE') {
          console.warn('Test cancelled, SERVICE_UNAVAILABLE');
          return;
        }
      }

      throw err;
    }
  });
});
