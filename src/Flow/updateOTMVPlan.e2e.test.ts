import { UTCDateMini } from '@date-fns/utc';
import { add, startOfDay } from 'date-fns';
import { afterAll, assert, beforeAll, describe, expect, test } from 'vitest';
import { TEST_B2B_OPTIONS } from '../../tests/options.js';
import { createFlowClient } from '../index.js';
import type { OTMVPlanRetrievalReply } from './types.js';

describe('updateOTMVPlan', async () => {
  const Flow = await createFlowClient(TEST_B2B_OPTIONS);

  let planBefore: OTMVPlanRetrievalReply['data'] | undefined;

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
      if (TEST_B2B_OPTIONS.flavour !== 'PREOPS' || !planBefore) {
        return;
      }

      function clearNmSchedules(plan: typeof planBefore) {
        assert(plan);

        const plans = plan.plans;

        assert(plans.tvsOTMVs?.item);

        for (const { value } of plans.tvsOTMVs.item) {
          const v = value?.item;
          if (!v) {
            continue;
          }

          for (const { value } of v) {
            if (value?.nmSchedule) {
              delete value.nmSchedule;
            }
          }
        }

        return plan;
      }

      // oxlint-disable-next-line no-unsafe-type-assertion no-explicit-any
      await Flow.updateOTMVPlan(clearNmSchedules(planBefore) as any);
    } catch (err) {
      console.warn('Error resetting otmv plan after test');
      console.log(JSON.stringify(err, null, 2));
    }
  });

  test.skip('LFERMS', async () => {
    try {
      assert(planBefore);

      if (TEST_B2B_OPTIONS.flavour !== 'PREOPS') {
        console.warn('B2B_FLAVOUR is not PREOPS, skipping test');
        return;
      }

      const hPlus10Min = add(new Date(), { minutes: 10 });

      const res = await Flow.updateOTMVPlan({
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
