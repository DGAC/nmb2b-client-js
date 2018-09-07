/* @flow */
import { getClients } from '../../tests/utils';
import { inspect } from 'util';
import { timeFormat } from '../utils/timeFormats';
import moment from 'moment';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

import { type B2BClient } from '../';
const b2bClient: B2BClient = global.__B2B_CLIENT__;
const conditionalTest = b2bClient ? test : test.skip;

describe('queryTrafficCountsByTrafficVolume', () => {
  conditionalTest('LFEE5R, aggregated', async () => {
    const { Flow } = b2bClient;

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
