import { describe, expect, test } from 'vitest';
import { makeAirspaceClient } from '..';
import b2bOptions from '../../tests/options';
import { shouldUseRealB2BConnection } from '../../tests/utils';

describe('retrieveAUPChain', async () => {
  const Airspace = await makeAirspaceClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('AUP Retrieval', async () => {
    const res = await Airspace.retrieveAUPChain({
      amcIds: ['LFFAZAMC'],
      chainDate: new Date(),
    });

    expect(res.status).toBe('OK');

    if (res.data) {
      expect(Array.isArray(res.data.chains)).toBe(true);
    }
  });
});
