import { GeneralInformationService } from '.';
import { makeGeneralInformationClient } from '..';
import b2bOptions from '../../tests/options';
jest.setTimeout(60000);

const conditionalTest = (global as any).__DISABLE_B2B_CONNECTIONS__
  ? test.skip
  : test;

let GeneralInformation: GeneralInformationService;
beforeAll(async () => {
  GeneralInformation = await makeGeneralInformationClient(b2bOptions);
});

describe('queryNMB2BWSDLs', () => {
  conditionalTest('Version 26.0.0', async () => {
    try {
      const res = await GeneralInformation.queryNMB2BWSDLs({
        version: '26.0.0',
      });
    } catch (err) {
      // console.error(inspect(err, { depth: null }));
      throw err;
    }
  });
});
