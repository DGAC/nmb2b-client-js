/* @flow */
import { getClients } from '../../tests/utils';
import { inspect } from 'util';
import { dateFormat, timeFormat } from '../utils/timeFormats';
import moment from 'moment';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

import { type B2BClient } from '../';
const b2bClient: B2BClient = global.__B2B_CLIENT__;
const conditionalTest = b2bClient ? test : test.skip;

describe('queryNMB2BWSDLs', () => {
  conditionalTest('Version 22.0.0', async () => {
    const GeneralInformation = b2bClient.GeneralInformation;

    try {
      const res = await GeneralInformation.queryNMB2BWSDLs({
        version: '22.0.0',
      });

      console.dir(res, { depth: null });
    } catch (err) {
      console.error(inspect(err, { depth: null }));
      throw err;
    }
  });
});
