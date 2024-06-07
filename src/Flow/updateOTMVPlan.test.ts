import { makeFlowClient } from '..';
import b2bOptions from '../../tests/options';
import type { Result as OTMVPlanUpdateResult } from './updateOTMVPlan';
import type { Result as OTMVPlanRetrievalResult } from './retrieveOTMVPlan';
import { describe, expect, beforeAll, afterAll, test, assert } from 'vitest';
import { add, startOfDay } from 'date-fns';
import { UTCDateMini } from '@date-fns/utc';

describe('updateOTMVPlan', async () => {
  const Flow = await makeFlowClient(b2bOptions);

  let planBefore: OTMVPlanRetrievalResult['data'] | undefined;

  beforeAll(async () => {
    const res = await Flow.retrieveOTMVPlan({
      dataset: { type: 'OPERATIONAL' },
      day: new Date(),
      otmvsWithDuration: {
        item: [
          {
            trafficVolume: 'LFERMS',
            otmvDuration: 11 * 60,
          },
        ],
      },
    });
    planBefore = res.data;
  });

  afterAll(async () => {
    try {
      if (b2bOptions.flavour !== 'PREOPS' || !planBefore) {
        return;
      }

      function clearNmSchedules(plan: typeof planBefore): typeof planBefore {
        assert(plan);

        const plans = plan.plans;

        for (const { value } of plans.tvsOTMVs.item) {
          const v = value.item;
          for (const { value } of v) {
            if (value.nmSchedule) {
              delete value.nmSchedule;
            }
          }
        }

        return plan;
      }

      await Flow.updateOTMVPlan(clearNmSchedules(planBefore));
    } catch (err) {
      console.warn('Error resetting otmv plan after test');
      console.log(JSON.stringify(err, null, 2));
      return;
    }
  });

  test.skip('LFERMS', async () => {
    try {
      assert(planBefore);

      if (b2bOptions.flavour !== 'PREOPS') {
        console.warn('B2B_FLAVOUR is not PREOPS, skipping test');
        return;
      }

      const hPlus10Min = add(new Date(), { minutes: 10 });

      const res: OTMVPlanUpdateResult = await Flow.updateOTMVPlan({
        plans: {
          dataId: planBefore.plans.dataId,
          dataset: { type: 'OPERATIONAL' },
          day: new Date(),
          tvsOTMVs: {
            item: [
              {
                key: 'LFERMS',
                value: {
                  item: [
                    {
                      key: 11 * 60,
                      value: {
                        clientSchedule: {
                          item: [
                            {
                              applicabilityPeriod: {
                                wef: startOfDay(new UTCDateMini()),
                                unt: hPlus10Min,
                              },
                              dataSource: 'AIRSPACE',
                            },
                            {
                              applicabilityPeriod: {
                                wef: hPlus10Min,
                                unt: add(startOfDay(new UTCDateMini()), {
                                  days: 1,
                                }),
                              },
                              dataSource: 'TACTICAL',
                              otmv: {
                                trafficVolume: 'LFERMS',
                                otmvDuration: 11 * 60,
                                peak: {
                                  threshold: 8,
                                },
                                sustained: {
                                  threshold: 5,
                                  crossingOccurrences: 99,
                                  elapsed: 139 * 60,
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      });

      expect(res.data).toBeDefined();

      // console.log(inspect(res.data, { depth: null }));
    } catch (err) {
      console.log(JSON.stringify(err));
      //console.log(inspect(err, { depth: 5 }));
      throw err;
    }
  });
});
