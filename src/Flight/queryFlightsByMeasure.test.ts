import { inspect } from 'util';
import { NMB2BError, makeFlightClient, makeFlowClient } from '..';
import b2bOptions from '../../tests/options';
import type { Regulation } from '../Flow/types';
import { beforeAll, describe, expect, test } from 'vitest';
import { shouldUseRealB2BConnection } from '../../tests/utils';
import { sub, add, startOfHour } from 'date-fns';
import { extractReferenceLocation } from '../utils';

describe('queryFlightsByMeasure', async () => {
  let measure: undefined | Regulation;

  const [Flight, Flow] = await Promise.all([
    makeFlightClient(b2bOptions),
    makeFlowClient(b2bOptions),
  ]);

  const window = {
    wef: startOfHour(sub(new Date(), { hours: 2 })),
    unt: startOfHour(add(new Date(), { hours: 2 })),
  };

  beforeAll(async () => {
    const res = await Flow.queryRegulations({
      dataset: { type: 'OPERATIONAL' },
      queryPeriod: window,
      requestedRegulationFields: {
        item: ['applicability', 'location', 'reason'],
      },
    });

    const hasAirspaceMatching = (regex: RegExp) => (item: Regulation) => {
      const referenceLocation = extractReferenceLocation(
        'referenceLocation',
        item.location,
      );

      if (!referenceLocation || referenceLocation.type !== 'AIRSPACE') {
        return false;
      }

      return regex.test(referenceLocation.id);
    };

    const candidates = res.data.regulations.item.filter(
      hasAirspaceMatching(/^LF/),
    );

    if (!candidates.length) {
      return;
    }

    measure = candidates[0];

    // console.log(inspect(measure, { depth: null }));
  });

  test.runIf(shouldUseRealB2BConnection)('query in regulation', async () => {
    if (!measure?.regulationId || !measure.applicability) {
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

      if (!res.data.flights) {
        console.warn('No flights in the response.');
        return;
      }

      expect(res.data.flights).toEqual(expect.any(Array));

      for (const flight of res.data.flights) {
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
      if (err instanceof NMB2BError) {
        console.log(inspect(err, { depth: 4 }));
      }

      throw err;
    }
  });
});
