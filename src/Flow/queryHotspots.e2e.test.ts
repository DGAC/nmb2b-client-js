import { inspect } from 'util';
import { describe, test } from 'vitest';
import { TEST_B2B_OPTIONS } from '../../tests/options.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';
import { createFlowClient, NMB2BError } from '../index.js';

describe('queryHotspots', async () => {
  const Flow = await createFlowClient(TEST_B2B_OPTIONS);

  // Not authorised with this certificate in OPS
  test.runIf(shouldUseRealB2BConnection)('List all hotspots', async () => {
    try {
      // oxlint-disable-next-line @typescript-eslint/no-unused-vars
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
