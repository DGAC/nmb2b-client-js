import { makeFlightClient } from '..';
import { add, sub } from 'date-fns';
import b2bOptions from '../../tests/options';
import { shouldUseRealB2BConnection } from '../../tests/utils';
import { describe, test, expect } from 'vitest';

describe('queryFlightsByAircraftOperator', async () => {
  const Flight = await makeFlightClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)(
    'query Aircraft Operators',
    async () => {
      const trafficWindow = {
        wef: sub(new Date(), { minutes: 10 }),
        unt: add(new Date(), { minutes: 10 }),
      };

      const res = await Flight.queryFlightsByAircraftOperator({
        dataset: { type: 'OPERATIONAL' },
        includeProposalFlights: false,
        includeForecastFlights: false,
        trafficType: 'LOAD',
        trafficWindow,
        aircraftOperators: ['AFR', 'RYR', 'UAE'],
        calculationType: 'OCCUPANCY', // Optional, default: 'ENTRY',
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
    },
  );
});
