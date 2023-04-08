import { AssertionError } from 'chai';
import moment from 'moment';
import { inspect } from 'util';
import { describe, expect, test } from 'vitest';
import { makeFlowClient } from '..';
import b2bOptions from '../../tests/options';
import { Result as CapacityPlanRetrievalResult } from './retrieveCapacityPlan';
import { Result as CapacityPlanUpdateResult } from './updateCapacityPlan';

describe('updateCapacityPlan', async () => {
  const Flow = await makeFlowClient(b2bOptions);

  test.skip('LFERMS', async () => {
    try {
      const plan: CapacityPlanRetrievalResult = await Flow.retrieveCapacityPlan(
        {
          dataset: { type: 'OPERATIONAL' },
          day: moment.utc().toDate(),
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

      const hPlus10Min: moment.Moment = moment.utc().add(10, 'minute');
      const res: CapacityPlanUpdateResult = await Flow.updateCapacityPlan({
        plans: {
          dataId: plan.data.plans.dataId,
          dataset: { type: 'OPERATIONAL' },
          day: moment.utc().toDate(),
          tvCapacities: {
            item: [
              {
                key: 'LFERMS',
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

      // console.log(inspect(res.data, { depth: null }));
    } catch (err) {
      if (err instanceof AssertionError) {
        throw err;
      }

      console.log(inspect(err, { depth: 5 }));
      throw err;
    }
  });
});
