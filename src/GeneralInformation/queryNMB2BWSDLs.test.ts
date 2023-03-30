import { GeneralInformationService } from '.';
import { makeGeneralInformationClient } from '..';
import b2bOptions from '../../tests/options';
import { shouldUseRealB2BConnection } from '../../tests/utils';
import { describe, test, expect } from 'vitest';

describe('queryNMB2BWSDLs', async () => {
  const GeneralInformation = await makeGeneralInformationClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('Version 26.0.0', async () => {
    const res = await GeneralInformation.queryNMB2BWSDLs({
      version: '26.0.0',
    });

    expect(res.data).toBeDefined();
    expect(res.data.file).toBeDefined();
    expect(res.data.file.id).toBeDefined();
  });
});
