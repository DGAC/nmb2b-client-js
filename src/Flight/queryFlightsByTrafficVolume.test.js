/* @flow */
import { inspect } from 'util';
import { makeFlightClient } from '../';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { flightPlanToFlightKeys } from './utils';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const conditionalTest = global.__DISABLE_B2B_CONNECTIONS__ ? test.skip : test;

let Flight;
beforeAll(async () => {
  Flight = await makeFlightClient(b2bOptions);
});

describe('queryFlightsByTrafficVolume', () => {
  conditionalTest('query in LFEERMS', async () => {
    const res = await Flight.queryFlightsByTrafficVolume({
      dataset: { type: 'OPERATIONAL' },
      includeProposalFlights: false,
      includeForecastFlights: false,
      trafficType: 'LOAD',
      trafficWindow: {
        wef: moment
          .utc()
          .subtract(10, 'minutes')
          .toDate(),
        unt: moment
          .utc()
          .add(10, 'minutes')
          .toDate(),
      },
      trafficVolume: 'EGKKARR',
    });

    expect(res.status).toBe('OK');

    if (!res.data) {
      // No flights in the TV, return early
      return;
    }
    const {
      data: { flights },
    } = res;

    !process.env.CI && console.log(inspect(res, { depth: null }));
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
