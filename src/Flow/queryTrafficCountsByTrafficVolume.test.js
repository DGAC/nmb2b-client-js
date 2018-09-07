/* @flow */
import { inspect } from 'util';
import { makeFlowClient } from '../';
import moment from 'moment';
import b2bOptions from '../../tests/options';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const conditionalTest = global.__DISABLE_B2B_CONNECTIONS__ ? test.skip : test;
const xconditionalTest = xtest;

let Flow;
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

      // $FlowFixMe
      expect(res.data.counts).toBeDefined();
      expect(Array.isArray(res.data.counts.item)).toBe(true);
      expect(res.data.counts.item.length).toBe(6);

      const testItem = item =>
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

      res.data.counts.item.forEach(testItem);
    } catch (err) {
      console.log(inspect(err, { depth: null }));
      throw err;
    }
  });
});
