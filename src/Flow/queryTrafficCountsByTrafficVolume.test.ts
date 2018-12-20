import { inspect } from 'util';
import { makeFlowClient } from '..';
import moment from 'moment';
// @ts-ignore
import b2bOptions from '../../tests/options';
import { FlowService } from '.';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const conditionalTest = (global as any).__DISABLE_B2B_CONNECTIONS__
  ? test.skip
  : test;
const xconditionalTest = xtest;

type Diff<T, U> = T extends U ? never : T;
type NonNullable<T> = Diff<T, null | undefined>;

let Flow: FlowService;
beforeAll(async () => {
  Flow = await makeFlowClient(b2bOptions);
});

describe('queryTrafficCountsByTrafficVolume', () => {
  conditionalTest('LFEE5R, aggregated', async () => {
    try {
      const res = await Flow.queryTrafficCountsByTrafficVolume({
        dataset: { type: 'OPERATIONAL' },
        trafficWindow: {
          wef: moment
            .utc()
            .subtract(1, 'hour')
            .startOf('hour')
            .toDate(),
          unt: moment
            .utc()
            .add(1, 'hour')
            .startOf('hour')
            .toDate(),
        },
        includeProposalFlights: false,
        includeForecastFlights: false,
        trafficTypes: { item: ['LOAD', 'DEMAND', 'REGULATED_DEMAND'] },
        computeSubTotals: false,
        countsInterval: {
          duration: 20 * 60,
          step: 20 * 60,
        },
        trafficVolume: 'LFRMZI',
        calculationType: 'OCCUPANCY',
      });

      expect(res.data.counts).toBeDefined();
      const { counts } = res.data;
      if (!counts) {
        // Should never happen;
        return;
      }

      expect(Array.isArray(counts.item)).toBe(true);
      expect(counts.item.length).toBe(6);

      const testItem = (item: any) =>
        expect(item).toMatchObject({
          key: {
            wef: expect.any(Date),
            unt: expect.any(Date),
          },
          value: {
            item: expect.arrayContaining([
              expect.objectContaining({
                key: 'DEMAND',
                value: { totalCounts: expect.any(Number) },
              }),
              expect.objectContaining({
                key: 'LOAD',
                value: { totalCounts: expect.any(Number) },
              }),
              expect.objectContaining({
                key: 'REGULATED_DEMAND',
                value: { totalCounts: expect.any(Number) },
              }),
            ]),
          },
        });

      counts.item.forEach(testItem);
    } catch (err) {
      console.log(inspect(err, { depth: null }));
      throw err;
    }
  });
});
