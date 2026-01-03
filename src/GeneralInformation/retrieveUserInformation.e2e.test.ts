import { describe, expect, test } from 'vitest';
import { TEST_B2B_OPTIONS } from '../../tests/options.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';
import { createGeneralInformationClient } from '../index.js';

describe('retrieveUserInformation', async () => {
  const GeneralInformation =
    await createGeneralInformationClient(TEST_B2B_OPTIONS);

  test.runIf(shouldUseRealB2BConnection)('basic', async () => {
    const res = await GeneralInformation.retrieveUserInformation({});

    expect(res.status).toBe('OK');
  });
});
