import b2bOptions from '../../tests/options.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';
import { createAirspaceClient } from '../index.js';
import { sub } from 'date-fns';
import { describe, test, expect, assert } from 'vitest';

describe('queryCompleteAIXMDatasets', async () => {
  const Airspace = await createAirspaceClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('Complete dataset', async () => {
    const res = await Airspace.queryCompleteAIXMDatasets({
      queryCriteria: {
        publicationPeriod: {
          wef: sub(new Date(), { days: 28 }),
          unt: new Date(),
        },
      },
    });

    expect(res.data?.datasetSummaries).toBeDefined();
    assert(res.data?.datasetSummaries);
    expect(res.data.datasetSummaries.length).toBeGreaterThanOrEqual(1);

    const dataset = res.data.datasetSummaries[0];
    assert(dataset);
    assert(Array.isArray(dataset.files));

    expect(dataset.files.length).toBeGreaterThan(0);

    dataset.files.forEach((f) => {
      expect(f).toMatchObject({
        id: expect.stringMatching(/BASELINE\.zip$/),
        fileLength: expect.any(Number),
        releaseTime: expect.any(Date),
        type: expect.any(String),
      });
    });
  });
});
