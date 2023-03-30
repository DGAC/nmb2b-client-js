import { makeAirspaceClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { AUPSummary } from './types';
import * as R from 'ramda';
import { shouldUseRealB2BConnection } from '../../tests/utils';
import { describe, beforeAll, test, expect } from 'vitest';

describe('retrieveAUP', async () => {
  const Airspace = await makeAirspaceClient(b2bOptions);

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
    }
  });

  test.runIf(shouldUseRealB2BConnection)('AUP Retrieval', async () => {
    if (AUPSummaries.length === 0) {
      console.warn('AUPChainRetrieval did not yield any AUP id');
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
