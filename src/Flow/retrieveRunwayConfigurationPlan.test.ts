import { inspect } from 'util';
import { makeFlowClient, B2BClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { FlowService } from '.';
import { RunwayConfigurationPlanRetrievalReply } from './types';
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

describe('retrieveRunwayConfigurationPlan', () => {
  conditionalTest('LFBD', async () => {
    try {
      const res: RunwayConfigurationPlanRetrievalReply =
        await Flow.retrieveRunwayConfigurationPlan({
          dataset: { type: 'OPERATIONAL' },
          day: moment.utc().toDate(),
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
      if (err instanceof JestAssertionError) {
        throw err;
      }

      console.log(inspect(err, { depth: 4 }));
      throw err;
    }
  });
});
