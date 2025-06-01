import { inspect } from 'util';
import { describe, expect, test } from 'vitest';
import b2bOptions from '../../tests/options.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';
import { createFlowClient, NMB2BError } from '../index.js';
import type { RunwayConfigurationPlanRetrievalReply } from './types.js';

describe('retrieveRunwayConfigurationPlan', async () => {
  const Flow = await createFlowClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('LFBD', async () => {
    try {
      const res: RunwayConfigurationPlanRetrievalReply =
        await Flow.retrieveRunwayConfigurationPlan({
          dataset: { type: 'OPERATIONAL' },
          day: new Date(),
          aerodrome: 'LFBD',
        });

      expect(res.data).toBeDefined();
      expect(res.data.plan.planCutOffReached).toEqual(expect.any(Boolean));
      expect(res.data.plan).toMatchObject({
        aerodrome: 'LFBD',
        planTransferred: expect.any(Boolean),
        planCutOffReached: expect.any(Boolean),
        knownRunwayIds: {
          item: expect.arrayContaining([expect.stringMatching(/^[0-9]{2}/)]),
        },
        nmSchedule: {
          item: expect.any(Array),
        },
        clientSchedule: {
          item: expect.any(Array),
        },
      });
    } catch (err) {
      if (err instanceof NMB2BError) {
        console.log(inspect(err, { depth: 4 }));
      }

      throw err;
    }
  });
});
