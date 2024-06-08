import b2bOptions from '../../tests/options';
import { shouldUseRealB2BConnection } from '../../tests/utils';
import { makeAirspaceClient } from '..';
import { sub } from 'date-fns';
import { describe, test, expect, assert } from 'vitest';

describe('queryCompleteAIXMDatasets', async () => {
  const Airspace = await makeAirspaceClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('Complete dataset', async () => {
    const res = await Airspace.queryCompleteAIXMDatasets({
      queryCriteria: {
        publicationPeriod: {
          wef: sub(new Date(), { days: 28 }),
          unt: new Date(),
        },
      },
    });

    expect(res.data.datasetSummaries).toBeDefined();
    expect(res.data.datasetSummaries.length).toBeGreaterThanOrEqual(1);
    const dataset = res.data.datasetSummaries[0];
    assert(dataset);
    expect(Array.isArray(dataset.files)).toBe(true);
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
