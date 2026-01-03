import { add, startOfHour, sub } from 'date-fns';
import { inspect } from 'util';
import { assert, beforeAll, describe, expect, test } from 'vitest';
import { TEST_B2B_OPTIONS } from '../../tests/options.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';
import type { Regulation } from '../Flow/types.js';
import { NMB2BError, createFlightClient, createFlowClient } from '../index.js';
import type { SafeB2BDeserializedResponse } from '../types.js';

describe('queryFlightsByMeasure', async () => {
  let measure: undefined | SafeB2BDeserializedResponse<Regulation>;

  const [Flight, Flow] = await Promise.all([
    createFlightClient(TEST_B2B_OPTIONS),
    createFlowClient(TEST_B2B_OPTIONS),
  ]);

  const window = {
    wef: startOfHour(sub(new Date(), { hours: 2 })),
    unt: startOfHour(add(new Date(), { hours: 2 })),
  };

  beforeAll(async () => {
    const res = await Flow.queryRegulations({
      dataset: { type: 'OPERATIONAL' },
      queryPeriod: window,
      regulationStates: {
        item: ['APPLIED'],
      },
      requestedRegulationFields: {
        item: ['applicability', 'location', 'reason', 'regulationState'],
      },
    });

    const candidates = res.data.regulations?.item;

    if (!candidates?.length) {
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

      for (const flightOrFlightPlan of res.data.flights) {
        assert('flight' in flightOrFlightPlan && !!flightOrFlightPlan.flight);

        const flight = flightOrFlightPlan.flight;
        assert(flight.flightId);

        if (!flight.flightId.keys?.aerodromeOfDeparture) {
          expect(flight.flightId.keys?.nonICAOAerodromeOfDeparture).toBe(true);
        }

        if (!flight.flightId.keys?.aerodromeOfDestination) {
          expect(flight.flightId.keys?.nonICAOAerodromeOfDestination).toBe(
            true,
          );
        }

        expect(flight).toMatchObject({
          flightId: {
            id: expect.any(String),
            keys: {
              aircraftId: expect.any(String),
              estimatedOffBlockTime: expect.any(Date),
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
