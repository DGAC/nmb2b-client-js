/* @flow */
import { getClients } from '../../tests/utils';
import { inspect } from 'util';
import { timeFormat } from '../utils/timeFormats';
import moment from 'moment';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

import { type B2BClient } from '../';
const b2bClient: B2BClient = global.__B2B_CLIENT__;
const conditionalTest = b2bClient ? test : test.skip;

describe('queryRegulations', () => {
  conditionalTest('List all regulations', async () => {
    const { Flow } = b2bClient;

    try {
      const res = await Flow.queryRegulations({
        dataset: { type: 'OPERATIONAL' },
        queryPeriod: {
          wef: moment
            .utc()
            .subtract(10, 'hour')
            .startOf('hour')
            .toDate(),
          unt: moment
            .utc()
            .add(10, 'hour')
            .startOf('hour')
            .toDate(),
        },
        requestedRegulationFields: {
          item: [
            'applicability',
            'location',
            'reason',
            'linkedRegulations',
            'scenarioReference',
          ],
        },
      });

      const items = res.data.regulations.item;

      expect(items).toBeDefined();
      expect(items.length).toBeGreaterThanOrEqual(1);

      // console.warn(inspect(items, { depth: null }));
      //
      // const filteredItems = items.filter(
      //   ({ location }) =>
      //     location["referenceLocation-ReferenceLocationAirspace"]
      // );
      //
      //
      // console.warn(JSON.stringify(filteredItems, null, 2));
      // const airspaces = filteredItems.map(
      //   ({ location }) =>
      //     location["referenceLocation-ReferenceLocationAirspace"].id
      // );
      //
      // console.warn(JSON.stringify(airspaces, null, 2));

      items.forEach(item => {
        expect(item.regulationId).toBeDefined();
        expect(item.location).toBeDefined();

        if (
          item.location &&
          // $FlowFixMe: https://github.com/facebook/flow/issues/2990
          item.location['referenceLocation-ReferenceLocationAirspace']
        ) {
          expect(
            item.location['referenceLocation-ReferenceLocationAirspace'],
          ).toMatchObject({
            type: 'AIRSPACE',
            id: expect.any(String),
          });
        }
      });
    } catch (err) {
      console.log(inspect(err, { depth: null }));
      throw err;
    }
  });
});
