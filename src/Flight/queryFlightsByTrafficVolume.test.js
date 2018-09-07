/* @flow */
import { getClients } from '../../tests/utils';
import { inspect } from 'util';
import { flightPlanToFlightKeys } from './utils';
import { timeFormat } from '../utils/timeFormats';
import moment from 'moment';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

import { type B2BClient } from '../';
const b2bClient: B2BClient = global.__B2B_CLIENT__;
const conditionalTest = b2bClient ? test : test.skip;

describe('queryFlightsByTrafficVolume', () => {
  conditionalTest('query in LFEERMS', async () => {
    const { Flight } = b2bClient;

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

    console.log(inspect(res, { depth: null }));
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
