import { sub } from 'date-fns';
import { describe, expect, test } from 'vitest';
import { TEST_B2B_OPTIONS } from '../../tests/options.ts';
import { shouldUseRealB2BConnection } from '../../tests/utils.ts';
import { createAirspaceClient } from '../index.ts';

describe('retrieveEAUPChain', async () => {
  const Airspace = await createAirspaceClient(TEST_B2B_OPTIONS);

  test.runIf(shouldUseRealB2BConnection)('EAUP Retrieval', async () => {
    const res = await Airspace.retrieveEAUPChain({
      // NOTE: We pull yesterday's chain to ensure its existence.
      chainDate: sub(new Date(), { days: 1 }),
    });

    expect(res.data.chain).toEqual({
      chainDate: expect.any(Date),
      eaups: expect.any(Array),
    });

    for (const eaup of res.data.chain.eaups ?? []) {
      expect(eaup).toEqual({
        releaseTime: expect.any(Date),
        validityPeriod: {
          wef: expect.any(Date),
          unt: expect.any(Date),
        },
        eaupId: {
          chainDate: expect.any(Date),
          sequenceNumber: expect.any(Number),
        },
      });
    }
  });
});
