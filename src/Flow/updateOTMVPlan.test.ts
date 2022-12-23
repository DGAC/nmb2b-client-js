import { inspect } from 'util';
import { makeFlowClient, B2BClient } from '..';
import moment from 'moment';
// @ts-ignore
import b2bOptions from '../../tests/options';
import { Result as OTMVPlanUpdateResult } from './updateOTMVPlan';
import { Result as OTMVPlanRetrievalResult } from './retrieveOTMVPlan';
import { FlowService } from '.';
jest.setTimeout(20000);

const conditionalTest = (global as any).__DISABLE_B2B_CONNECTIONS__
  ? test.skip
  : test;
const xconditionalTest = xtest;

let Flow: FlowService;
beforeAll(async () => {
  Flow = await makeFlowClient(b2bOptions);
});

describe('updateOTMVPlan', () => {
  conditionalTest('LFERMS', async () => {
    try {
      const plan: OTMVPlanRetrievalResult = await Flow.retrieveOTMVPlan({
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

      expect(plan.data).toBeDefined();

      if (b2bOptions.flavour !== 'PREOPS') {
        console.warn('B2B_FLAVOUR is not PREOPS, skipping test');
        return;
      }

      const hPlus10Min: moment.Moment = moment.utc().add(10, 'minute');
      const res: OTMVPlanUpdateResult = await Flow.updateOTMVPlan({
        plans: {
          dataId: plan.data.plans.dataId,
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
