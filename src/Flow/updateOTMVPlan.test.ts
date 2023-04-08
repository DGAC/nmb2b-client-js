import { inspect } from 'util';
import { makeFlowClient, B2BClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { Result as OTMVPlanUpdateResult } from './updateOTMVPlan';
import { Result as OTMVPlanRetrievalResult } from './retrieveOTMVPlan';
import { FlowService } from '.';
import { describe, expect, beforeAll, afterAll, test } from 'vitest';

describe('updateOTMVPlan', async () => {
  const Flow = await makeFlowClient(b2bOptions);

  let planBefore: OTMVPlanRetrievalResult['data'];
  beforeAll(async () => {
    const res = await Flow.retrieveOTMVPlan({
      dataset: { type: 'OPERATIONAL' },
      day: moment.utc().toDate(),
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
        const plans = plan.plans;

        for (const { key, value } of plans.tvsOTMVs.item) {
          const v = value.item;
          for (const { key, value } of v) {
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
      expect(planBefore).toBeDefined();

      if (b2bOptions.flavour !== 'PREOPS') {
        console.warn('B2B_FLAVOUR is not PREOPS, skipping test');
        return;
      }

      const hPlus10Min: moment.Moment = moment.utc().add(10, 'minute');

      const res: OTMVPlanUpdateResult = await Flow.updateOTMVPlan({
        plans: {
          dataId: planBefore.plans.dataId,
          dataset: { type: 'OPERATIONAL' },
          day: moment.utc().toDate(),
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
                                wef: moment.utc().startOf('day').toDate(), //.format('YYYY-MM-DD HH:mm'),//.toDate(),
                                unt: hPlus10Min.toDate(),
                              },
                              dataSource: 'AIRSPACE',
                            },
                            {
                              applicabilityPeriod: {
                                wef: hPlus10Min.toDate(),
                                unt: moment
                                  .utc()
                                  .add(1, 'day')
                                  .startOf('day')
                                  .toDate(),
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
