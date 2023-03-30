import { makeFlightClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { shouldUseRealB2BConnection } from '../../tests/utils';
import { describe, test, expect } from 'vitest';

describe('queryFlightsByAirspace', async () => {
  const Flight = await makeFlightClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('query in LFEERMS', async () => {
    const trafficWindow = {
      wef: moment.utc().subtract(10, 'minutes').toDate(),
      unt: moment.utc().add(10, 'minutes').toDate(),
    };

    const res = await Flight.queryFlightsByAirspace({
      dataset: { type: 'OPERATIONAL' },
      includeProposalFlights: false,
      includeForecastFlights: false,
      trafficType: 'LOAD',
      trafficWindow,
      airspace: 'LFEERMS',
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
  });
});
