import { describe, expect, test } from 'vitest';
import b2bOptions from '../../tests/options.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';
import { createGeneralInformationClient } from '../index.js';

describe('retrieveUserInformation', async () => {
  const GeneralInformation = await createGeneralInformationClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('basic', async () => {
    const res = await GeneralInformation.retrieveUserInformation({});

    expect(res.status).toBe('OK');
  });
});
