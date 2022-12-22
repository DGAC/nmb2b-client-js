import { inspect } from 'util';
import { makeFlightClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { FlightService } from '.';
jest.setTimeout(20000);

const conditionalTest = (global as any).__DISABLE_B2B_CONNECTIONS__
  ? test.skip
  : test;

let Flight: FlightService;
beforeAll(async () => {
  Flight = await makeFlightClient(b2bOptions);
});

describe('queryFlightsByTrafficVolume', () => {
  conditionalTest('query in LFERMS', async () => {
    const trafficWindow = {
      wef: moment.utc().subtract(2, 'hours').toDate(),
      unt: moment.utc().add(2, 'hours').toDate(),
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

    if (!res.data || !res.data.flights) {
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
