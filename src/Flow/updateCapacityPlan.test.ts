import { inspect } from 'util';
import { makeFlowClient, B2BClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { Result as CapacityPlanUpdateResult } from './updateCapacityPlan';
import { Result as CapacityPlanRetrievalResult } from './retrieveCapacityPlan';
import { FlowService } from '.';
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

describe('updateCapacityPlan', () => {
  conditionalTest('LFERMS', async () => {
    return;

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
      if (err instanceof JestAssertionError) {
        throw err;
      }

      console.log(inspect(err, { depth: 5 }));
      throw err;
    }
  });
});
