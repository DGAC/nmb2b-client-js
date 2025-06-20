import { makeGeneralInformationClient } from '../index.js';
import b2bOptions from '../../tests/options.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';
import { describe, test, expect } from 'vitest';

describe('queryNMB2BWSDLs', async () => {
  const GeneralInformation = await makeGeneralInformationClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('Version 27.0.0', async () => {
    const res = await GeneralInformation.queryNMB2BWSDLs({
      version: '27.0.0',
    });

    expect(res.data).toBeDefined();
    expect(res.data.file).toBeDefined();
    expect(res.data.file.id).toBeDefined();
  });
});
