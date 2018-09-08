/* @flow */
import { inspect } from 'util';
import { makeAirspaceClient } from '../';
import moment from 'moment';
import b2bOptions from '../../tests/options';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const conditionalTest = global.__DISABLE_B2B_CONNECTIONS__ ? test.skip : test;

let Airspace;
beforeAll(async () => {
  Airspace = await makeAirspaceClient(b2bOptions);
});

describe('retrieveAUP', () => {
  let AUPIds = [];
  beforeAll(async () => {
    // Find some AUP id
    const res = await Airspace.retrieveAUPChain({
      amcIds: ['LFFAZAMC'],
      chainDate: moment.utc().toDate(),
    });
    
    if (res.data) {
      AUPIds = res.data.chains[0].aups.map(({ id }) => id);
    }
  });

  conditionalTest('AUP Retrieval', async () => {
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
