import { add, sub } from 'date-fns';
import { makeFlightClient } from '..';
import b2bOptions from '../../tests/options';
import { shouldUseRealB2BConnection } from '../../tests/utils';
import { describe, test, expect, assert } from 'vitest';

describe('queryFlightsByAirspace', async () => {
  const Flight = await makeFlightClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('query in LFPG', async () => {
    const trafficWindow = {
      wef: sub(new Date(), { minutes: 10 }),
      unt: add(new Date(), { minutes: 10 }),
    };

    const res = await Flight.queryFlightsByAerodrome({
      dataset: { type: 'OPERATIONAL' },
      includeProposalFlights: false,
      includeForecastFlights: false,
      trafficType: 'LOAD',
      trafficWindow,
      aerodrome: 'LFPG',
      aerodromeRole: 'GLOBAL',
    });

    /**
     * Here, we ensure the returned traffic window matches the supplied
     * traffic window, with a 60s precision.
     */
    expect(
      Math.abs(
        res.data.effectiveTrafficWindow.wef.getTime() -
          trafficWindow.wef.getTime(),
      ),
    ).toBeLessThan(60 * 1000);

    expect(
      Math.abs(
        res.data.effectiveTrafficWindow.unt.getTime() -
          trafficWindow.unt.getTime(),
      ),
    ).toBeLessThan(60 * 1000);

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
  });
});
