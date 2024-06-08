import { describe, expect, test } from 'vitest';
import { makeAirspaceClient } from '..';
import b2bOptions from '../../tests/options';
import { shouldUseRealB2BConnection } from '../../tests/utils';

describe('retrieveEAUPChain', async () => {
  const Airspace = await makeAirspaceClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('EAUP Retrieval', async () => {
    const res = await Airspace.retrieveEAUPChain({
      chainDate: new Date(),
    });

    expect(res.data.chain).toEqual({
      chainDate: expect.any(Date),
      eaups: expect.any(Array),
    });

    for (const eaup of res.data.chain.eaups) {
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
