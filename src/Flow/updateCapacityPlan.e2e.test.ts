import { add, startOfDay } from 'date-fns';
import { inspect } from 'util';
import { describe, expect, test } from 'vitest';
import b2bOptions from '../../tests/options.js';
import { NMB2BError, createFlowClient } from '../index.js';

describe('updateCapacityPlan', async () => {
  const Flow = await createFlowClient(b2bOptions);

  test.skip('LFERMS', async () => {
    try {
      const plan = await Flow.retrieveCapacityPlan({
        dataset: { type: 'OPERATIONAL' },
        day: new Date(),
        trafficVolumes: {
          item: ['LFERMS'],
        },
      });

      expect(plan.data).toBeDefined();

      if (b2bOptions.flavour !== 'PREOPS') {
        console.warn('B2B_FLAVOUR is not PREOPS, skipping test');
        return;
      }

      const hPlus10Min = add(new Date(), { minutes: 10 });
      const res = await Flow.updateCapacityPlan({
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
