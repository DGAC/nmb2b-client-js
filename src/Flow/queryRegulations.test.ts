import { inspect } from 'util';
import { makeFlowClient } from '..';
import moment from 'moment';
// @ts-ignore
import b2bOptions from '../../tests/options';
jest.setTimeout(20000);

import { RegulationListReply } from './queryRegulations';
import { FlowService } from '.';

const conditionalTest = (global as any).__DISABLE_B2B_CONNECTIONS__
  ? test.skip
  : test;
const xconditionalTest = xtest;

let Flow: FlowService;
beforeAll(async () => {
  Flow = await makeFlowClient(b2bOptions);
});

describe('queryRegulations', () => {
  conditionalTest('List all regulations', async () => {
    try {
      const res: RegulationListReply = await Flow.queryRegulations({
        dataset: { type: 'OPERATIONAL' },
        queryPeriod: {
          wef: moment.utc().subtract(10, 'hour').startOf('hour').toDate(),
          unt: moment.utc().add(10, 'hour').startOf('hour').toDate(),
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

      items.forEach((item) => {
        expect(item.regulationId).toBeDefined();
        if (!item.location) {
          return;
        }

        const location = item.protectedLocation || item.location;

        if ('referenceLocation-ReferenceLocationAirspace' in location) {
          expect(
            location['referenceLocation-ReferenceLocationAirspace'],
          ).toMatchObject({
            type: 'AIRSPACE',
            id: expect.any(String),
          });
        } else if ('referenceLocation-ReferenceLocationAerodrome' in location) {
          expect(
            location['referenceLocation-ReferenceLocationAerodrome'],
          ).toMatchObject({
            type: 'AERODROME',
            id: expect.any(String),
          });
        }
      });
    } catch (err) {
      console.log(inspect(err, { depth: 4 }));
      throw err;
    }
  });
});
