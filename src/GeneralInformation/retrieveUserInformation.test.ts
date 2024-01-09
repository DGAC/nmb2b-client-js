import { makeGeneralInformationClient } from '..';
import b2bOptions from '../../tests/options';
import { shouldUseRealB2BConnection } from '../../tests/utils';
import { describe, test, expect } from 'vitest';

describe('retrieveUserInformation', async () => {
  const GeneralInformation = await makeGeneralInformationClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('basic', async () => {
    const res = await GeneralInformation.retrieveUserInformation();

    expect(res.status).toBe('OK');
  });
});
