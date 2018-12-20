// import { getClients } from '../../tests/utils';
// @ts-ignore
import b2bOptions from '../../tests/options';
import { makeAirspaceClient } from '..';
import { inspect } from 'util';
import moment from 'moment';
import { AirspaceService } from '.';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const conditionalTest = (global as any).__DISABLE_B2B_CONNECTIONS__
  ? test.skip
  : test;

let Airspace: AirspaceService;

beforeAll(async () => {
  Airspace = await makeAirspaceClient(b2bOptions);
});

describe('queryCompleteAIXMDatasets', () => {
  conditionalTest('Complete dataset', async () => {
    const res = await Airspace.queryCompleteAIXMDatasets({
      queryCriteria: {
        publicationPeriod: {
          wef: moment
            .utc()
            .subtract(28, 'days')
            .toDate(),
          unt: moment.utc().toDate(),
        },
      },
    });

    expect(res.data.datasetSummaries).toBeDefined();
    expect(res.data.datasetSummaries.length).toBeGreaterThanOrEqual(1);
    const dataset = res.data.datasetSummaries[0];
    expect(Array.isArray(dataset.files)).toBe(true);
    dataset.files.forEach(f => {
      expect(f).toMatchObject({
        id: expect.stringMatching(/BASELINE\.zip$/),
      });
    });
  });
});
