/* @flow */
import { inspect } from 'util';
import { dateFormat, timeFormat } from '../utils/timeFormats';
import moment from 'moment';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

import { type B2BClient } from '../';
const b2bClient: B2BClient = global.__B2B_CLIENT__;
const conditionalTest = b2bClient ? test : test.skip;

describe('retrieveAUP', () => {
  let AUPIds = [];
  beforeAll(async () => {
    if(!b2bClient) {
      return;
    }

    const { Airspace } = b2bClient;

    // Find some AUP id
    const res = await Airspace.retrieveAUPChain({
      amcIds: ['LFFAZAMC'],
      chainDate: moment.utc().toDate(),
    });

    AUPIds = res.data.chains[0].aups.map(({ id }) => id);
  });

  conditionalTest('AUP Retrieval', async () => {
    const { Airspace } = b2bClient;

    if (AUPIds.length === 0) {
      console.error('AUPChainRetrieval did not yield any AUP id');
      return;
    }

    const res = await Airspace.retrieveAUP({
      aupId: AUPIds[0],
    });

    expect(res.data.aup).toBeDefined();
    expect(res.data.aup.summary).toBeDefined();
    expect(res.data.aup.aupManualEntries).toBeDefined();
  });
});
