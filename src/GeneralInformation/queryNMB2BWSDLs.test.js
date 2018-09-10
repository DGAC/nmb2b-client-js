/* @flow */
import { inspect } from 'util';
import { makeGeneralInformationClient } from '../';
import moment from 'moment';
import b2bOptions from '../../tests/options';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const conditionalTest = global.__DISABLE_B2B_CONNECTIONS__ ? test.skip : test;

let GeneralInformation;
beforeAll(async () => {
  GeneralInformation = await makeGeneralInformationClient(b2bOptions);
});

describe('queryNMB2BWSDLs', () => {
  conditionalTest('Version 22.0.0', async () => {
    try {
      const res = await GeneralInformation.queryNMB2BWSDLs({
        version: '22.0.0',
      });

      process.env.CI && console.dir(res, { depth: null });
    } catch (err) {
      console.error(inspect(err, { depth: null }));
      throw err;
    }
  });
});
