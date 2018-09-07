/* @flow */
import { getClients } from '../../tests/utils';
import { inspect } from 'util';
import { dateFormat, timeFormat } from '../utils/timeFormats';
import moment from 'moment';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

import { type B2BClient } from '../';
const b2bClient: B2BClient = global.__B2B_CLIENT__;
const conditionalTest = b2bClient ? test : test.skip;

describe('retrieveAUPChain', () => {
  conditionalTest('AUP Retrieval', async () => {
    const { Airspace } = b2bClient;

    const res = await Airspace.retrieveAUPChain({
      amcIds: ['LFFAZAMC'],
      chainDate: new Date(),
    });

    expect(Array.isArray(res.data.chains)).toBe(true);
  });
});
