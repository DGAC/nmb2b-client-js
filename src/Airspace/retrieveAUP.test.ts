import { inspect } from 'util';
import { makeAirspaceClient } from '..';
import moment from 'moment';
// @ts-ignore
import b2bOptions from '../../tests/options';
import { AirspaceService } from '.';
import { AUPSummary } from './types';
import * as R from 'ramda';

jest.setTimeout(20000);

const conditionalTest = (global as any).__DISABLE_B2B_CONNECTIONS__
  ? test.skip
  : test;

let Airspace: AirspaceService;
beforeAll(async () => {
  Airspace = await makeAirspaceClient(b2bOptions);
});

describe('retrieveAUP', () => {
  let AUPSummaries: AUPSummary[] = [];
  beforeAll(async () => {
    // Find some AUP id
    const res = await Airspace.retrieveAUPChain({
      amcIds: ['LFFAZAMC'],
      chainDate: moment.utc().toDate(),
    });

    if (res.data) {
      AUPSummaries = R.compose<
        AUPSummary[],
        AUPSummary[],
        AUPSummary[],
        AUPSummary[]
      >(
        R.filter<AUPSummary>(({ aupState }) => aupState === 'RELEASED'),
        R.reverse,
        R.sortBy(({ lastUpdate }) => lastUpdate.timestamp),
      )(res.data.chains[0].aups);

      console.log(AUPSummaries);
    }
  });

  conditionalTest('AUP Retrieval', async () => {
    if (AUPSummaries.length === 0) {
      console.error('AUPChainRetrieval did not yield any AUP id');
      return;
    }

    const res = await Airspace.retrieveAUP({
      aupId: AUPSummaries[0].id,
      returnComputed: true,
    });

    expect(res.data.aup).toBeDefined();
    expect(res.data.aup.summary).toBeDefined();
    // console.log(inspect(res.data.aup.aupManualEntries, { depth: null }));
    expect(res.data.aup.aupManualEntries).toBeDefined();
  });
});
