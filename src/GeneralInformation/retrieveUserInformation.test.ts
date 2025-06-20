import { makeGeneralInformationClient } from '../index.js';
import b2bOptions from '../../tests/options.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';
import { describe, test, expect } from 'vitest';

describe('retrieveUserInformation', async () => {
  const GeneralInformation = await makeGeneralInformationClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('basic', async () => {
    const res = await GeneralInformation.retrieveUserInformation({});

    expect(res.status).toBe('OK');
  });
});
