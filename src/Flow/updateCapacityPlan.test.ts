import { inspect } from 'util';
import { makeFlowClient, B2BClient } from '..';
import moment from 'moment';
// @ts-ignore
import b2bOptions from '../../tests/options';
import { Result as CapacityPlanUpdateResult } from './updateCapacityPlan';
import { Result as CapacityPlanRetrievalResult } from './retrieveCapacityPlan';
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

describe('updateCapacityPlan', () => {
  conditionalTest('LFERMS', async () => {
    try {
      const plan: CapacityPlanRetrievalResult = await Flow.retrieveCapacityPlan({
        dataset: { type: 'OPERATIONAL' },
        day: moment.utc().toDate(),
        trafficVolumes: {
          item: ['LFERMS'],
        },
      });
      if (plan.data == undefined){
        fail('capacityPlanRetrievalRequest has failed in the updateCapcityPlan');
      }
      if (b2bOptions.flavour == 'PREOPS'){
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
                            wef: moment
                              .utc()
                              .startOf('day')
                              .toDate(),//.format('YYYY-MM-DD HH:mm'),//.toDate(),
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
      } else {
        fail('You must be in PREOPS to test the updateCapacityPlan');
      }
      

      
      // console.log(inspect(res.data, { depth: null }));
    } catch (err) {
      console.log(JSON.stringify(err));
      //console.log(inspect(err, { depth: 5 }));
      throw err;
    }
  });
});
