import { inspect } from 'util';
import { makeFlightClient, makeFlowClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { Regulation } from '../Flow/types';
import { beforeAll, describe, expect, test } from 'vitest';
import { AssertionError } from 'chai';
import { shouldUseRealB2BConnection } from '../../tests/utils';

describe('queryFlightsByMeasure', async () => {
  let measure: void | Regulation;

  const [Flight, Flow] = await Promise.all([
    makeFlightClient(b2bOptions),
    makeFlowClient(b2bOptions),
  ]);

  const window = {
    wef: moment.utc().subtract(2, 'hour').startOf('hour').toDate(),
    unt: moment.utc().add(2, 'hour').startOf('hour').toDate(),
  };

  beforeAll(async () => {
    const res = await Flow.queryRegulations({
      dataset: { type: 'OPERATIONAL' },
      queryPeriod: window,
      requestedRegulationFields: {
        item: ['applicability', 'location', 'reason'],
      },
    });

    // console.log(res.data.regulations.item);

    const hasAirspaceMatching = (regex: RegExp) => (item: any) =>
      item &&
      item.location &&
      item.location['referenceLocation-ReferenceLocationAirspace'] &&
      item.location['referenceLocation-ReferenceLocationAirspace'].id &&
      regex.test(
        item.location['referenceLocation-ReferenceLocationAirspace'].id,
      );

    const candidates = res.data.regulations?.item?.filter(
      hasAirspaceMatching(/^LF/),
    );

    if (!candidates?.length) {
      return;
    }

    measure = candidates[0];

    // console.log(inspect(measure, { depth: null }));
  });

  test.runIf(shouldUseRealB2BConnection)('query in regulation', async () => {
    if (!measure || !measure.regulationId || !measure.applicability) {
      console.warn('No measure was found, cannot query flights by measure');
      return;
    }

    try {
      const res = await Flight.queryFlightsByMeasure({
        dataset: { type: 'OPERATIONAL' },
        includeProposalFlights: false,
        includeForecastFlights: false,
        trafficType: 'LOAD',
        trafficWindow: measure.applicability,
        measure: { REGULATION: measure.regulationId },
        mode: 'CONCERNED_BY_MEASURE',
      });

      expect(res.data.effectiveTrafficWindow).toEqual(measure.applicability);
      expect(res.data?.flights).toEqual(expect.any(Array));
      for (const flight of res.data?.flights) {
        expect(flight).toMatchObject({
          flight: {
            flightId: {
              id: expect.any(String),
              keys: {
                aircraftId: expect.any(String),
                aerodromeOfDeparture: expect.stringMatching(/^[A-Z]{4}$/),
                aerodromeOfDestination: expect.stringMatching(/^[A-Z]{4}$/),
                estimatedOffBlockTime: expect.any(Date),
              },
            },
          },
        });
      }
    } catch (err) {
      if (err instanceof AssertionError) {
        throw err;
      }

      console.log(inspect(err, { depth: 4 }));
      throw err;
    }
  });
});
