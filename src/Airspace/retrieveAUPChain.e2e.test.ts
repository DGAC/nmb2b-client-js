import { describe, expect, test } from 'vitest';
import { createAirspaceClient } from '../index.js';
import { TEST_B2B_OPTIONS } from '../../tests/options.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';

describe('retrieveAUPChain', async () => {
  const Airspace = await createAirspaceClient(TEST_B2B_OPTIONS);

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
