import { assert, beforeAll, describe, expect, test } from 'vitest';
import { makeAirspaceClient } from '..';
import b2bOptions from '../../tests/options';
import { shouldUseRealB2BConnection } from '../../tests/utils';

describe('retrieveAUP', async () => {
  const Airspace = await makeAirspaceClient(b2bOptions);

  let AUPSummaryIds: Array<string> = [];
  beforeAll(async () => {
    // Find some AUP id
    const res = await Airspace.retrieveAUPChain({
      amcIds: ['LFFAZAMC'],
      chainDate: new Date(),
    });

    assert(res.data?.chains?.[0]?.aups);

    const summaries = res.data.chains[0].aups.filter(
      ({ aupState }) => aupState === 'RELEASED',
    );
    summaries.sort(
      (a, b) =>
        (a.lastUpdate?.timestamp.valueOf() ?? 0) -
        (b.lastUpdate?.timestamp.valueOf() ?? 0),
    );

    AUPSummaryIds = summaries.map(({ id }) => id);
  });

  test.runIf(shouldUseRealB2BConnection)('AUP Retrieval', async () => {
    if (!AUPSummaryIds[0]) {
      console.warn('AUPChainRetrieval did not yield any AUP id');
      return;
    }

    const res = await Airspace.retrieveAUP({
      aupId: AUPSummaryIds[0],
      returnComputed: true,
    });

    expect(res.data.aup).toBeDefined();
    expect(res.data.aup.summary).toBeDefined();
    // console.log(inspect(res.data.aup.aupManualEntries, { depth: null }));
    expect(res.data.aup.aupManualEntries).toBeDefined();
  });
});
