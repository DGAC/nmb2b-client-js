import { makeFlightClient } from '..';
import b2bOptions from '../../tests/options';
import { shouldUseRealB2BConnection } from '../../tests/utils';
import { describe, expect, test } from 'vitest';
import { add, sub } from 'date-fns';

describe('queryFlightsByTrafficVolume', async () => {
  const Flight = await makeFlightClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('query in LFERMS', async () => {
    const trafficWindow = {
      wef: sub(new Date(), { hours: 2 }),
      unt: add(new Date(), { hours: 2 }),
    };

    const res = await Flight.queryFlightsByTrafficVolume({
      dataset: { type: 'OPERATIONAL' },
      includeProposalFlights: false,
      includeForecastFlights: false,
      trafficType: 'LOAD',
      trafficWindow,
      trafficVolume: 'LFERMS',
    });

    expect(res.status).toBe('OK');

    if (!res.data.flights) {
      // No flights in the TV, return early
      console.warn('No flights returned in the query');
      return;
    }
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

    expect(res.data.flights).toEqual(expect.any(Array));

    for (const flight of res.data.flights) {
      if (!('flight' in flight)) {
        continue;
      }

      const flightKeysMatcher: Record<string, any> = {
        aircraftId: expect.any(String),
        nonICAOAerodromeOfDeparture: expect.any(Boolean),
        nonICAOAerodromeOfDestination: expect.any(Boolean),
        estimatedOffBlockTime: expect.any(Date),
      };

      if (!flight.flight.flightId.keys?.nonICAOAerodromeOfDeparture) {
        flightKeysMatcher.aerodromeOfDeparture =
          expect.stringMatching(/^[A-Z]{4}$/);
      }

      if (!flight.flight.flightId.keys?.nonICAOAerodromeOfDestination) {
        flightKeysMatcher.aerodromeOfDestination =
          expect.stringMatching(/^[A-Z]{4}$/);
      }

      expect(flight).toMatchObject({
        flight: {
          flightId: {
            id: expect.any(String),
            keys: flightKeysMatcher,
          },
        },
      });
    }
  });
});
