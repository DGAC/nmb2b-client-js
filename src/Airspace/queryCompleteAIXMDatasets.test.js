/* @flow */
import { getClients } from '../../tests/utils';
import { inspect } from 'util';
import { dateFormat, timeFormat } from '../utils/timeFormats';
import moment from 'moment';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const conditionalTest = global.__B2B_CLIENT__ ? test : test.skip;

describe('queryCompleteAIXMDatasets', () => {
  conditionalTest('Complete dataset', async () => {
    const Airspace = global.__B2B_CLIENT__.Airspace;

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
