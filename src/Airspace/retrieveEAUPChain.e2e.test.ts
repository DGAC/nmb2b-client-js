import { sub } from 'date-fns';
import { describe, expect, test } from 'vitest';

import { TEST_B2B_OPTIONS } from '../../tests/options.ts';
import { shouldUseRealB2BConnection } from '../../tests/utils.ts';
import { createAirspaceClient } from '../index.ts';

describe('retrieveEAUPChain', async () => {
  const Airspace = await createAirspaceClient(TEST_B2B_OPTIONS);

  // Skipped temporarily, its timeouts fail CI on unrelated PRs.
  // https://github.com/DGAC/nmb2b-client-js/issues/397 decides how it comes back.
  // oxlint-disable-next-line vitest/no-disabled-tests -- See the comment above
  test.runIf(shouldUseRealB2BConnection).skip('EAUP Retrieval', async () => {
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
