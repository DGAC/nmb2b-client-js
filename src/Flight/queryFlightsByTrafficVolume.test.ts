import { inspect } from 'util';
import { makeFlightClient } from '..';
import moment from 'moment';
// @ts-ignore
import b2bOptions from '../../tests/options';
import { flightPlanToFlightKeys } from './utils';
import { FlightService } from '.';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const conditionalTest = (global as any).__DISABLE_B2B_CONNECTIONS__
  ? test.skip
  : test;

let Flight: FlightService;
beforeAll(async () => {
  Flight = await makeFlightClient(b2bOptions);
});

describe('queryFlightsByTrafficVolume', () => {
  conditionalTest('query in LFERMS', async () => {
    const res = await Flight.queryFlightsByTrafficVolume({
      dataset: { type: 'OPERATIONAL' },
      includeProposalFlights: false,
      includeForecastFlights: false,
      trafficType: 'LOAD',
      trafficWindow: {
        wef: moment
          .utc()
          .subtract(2, 'hours')
          .toDate(),
        unt: moment
          .utc()
          .add(2, 'hours')
          .toDate(),
      },
      trafficVolume: 'LFERMS',
    });

    expect(res.status).toBe('OK');

    if (!res.data || !res.data.flights) {
      // No flights in the TV, return early
      console.warn('No flights returned in the query');
      return;
    }
    const {
      data: { flights },
    } = res;

    expect(Array.isArray(flights)).toBe(true);

    flights.forEach(flight =>
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
      }),
    );
  });
});
