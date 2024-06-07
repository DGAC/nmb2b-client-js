import { inspect } from 'util';
import { describe, expect, test } from 'vitest';
import { NMB2BError, makeFlowClient } from '..';
import b2bOptions from '../../tests/options';
import type { Result as CapacityPlanRetrievalResult } from './retrieveCapacityPlan';
import type { Result as CapacityPlanUpdateResult } from './updateCapacityPlan';
import { add, startOfDay } from 'date-fns';

describe('updateCapacityPlan', async () => {
  const Flow = await makeFlowClient(b2bOptions);

  test.skip('LFERMS', async () => {
    try {
      const plan: CapacityPlanRetrievalResult = await Flow.retrieveCapacityPlan(
        {
          dataset: { type: 'OPERATIONAL' },
          day: new Date(),
          trafficVolumes: {
            item: ['LFERMS'],
          },
        },
      );

      expect(plan.data).toBeDefined();

      if (b2bOptions.flavour !== 'PREOPS') {
        console.warn('B2B_FLAVOUR is not PREOPS, skipping test');
        return;
      }

      const hPlus10Min = add(new Date(), { minutes: 10 });
      const res: CapacityPlanUpdateResult = await Flow.updateCapacityPlan({
        plans: {
          dataId: plan.data.plans.dataId,
          dataset: { type: 'OPERATIONAL' },
          day: new Date(),
          tvCapacities: {
            item: [
              {
                key: 'LFERMS',
                value: {
                  clientSchedule: {
                    item: [
                      {
                        applicabilityPeriod: {
                          wef: startOfDay(new Date()),
                          unt: hPlus10Min,
                        },
                        dataSource: 'AIRSPACE',
                      },
                      {
                        applicabilityPeriod: {
                          wef: hPlus10Min,
                          unt: startOfDay(add(new Date(), { days: 1 })),
                        },
                        dataSource: 'TACTICAL',
                        capacity: 2,
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      });

      expect(res.data).toBeDefined();
    } catch (err) {
      if (err instanceof NMB2BError) {
        console.log(inspect(err, { depth: 4 }));
      }

      throw err;
    }
  });
});
