/* @flow */
import { inspect } from 'util';
import { flightPlanToFlightKeys } from './utils';
import { timeFormat } from '../utils/timeFormats';
import { getClients } from '../../tests/utils';
import moment from 'moment';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

import { type B2BClient } from '../';
const b2bClient: B2BClient = global.__B2B_CLIENT__;
const conditionalTest = b2bClient ? test : test.skip;

describe('queryFlightsByAirspace', () => {
  conditionalTest('query in LFEERMS', async () => {
    const { Flight } = b2bClient;

    const res = await Flight.queryFlightsByAirspace({
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
      airspace: 'LFEERMS',
    });

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
              // aerodromeOfDeparture: expect.stringMatching(/^[A-Z]{4}$/),
              // aerodromeOfDestination: expect.stringMatching(/^[A-Z]{4}$/),
              estimatedOffBlockTime: expect.any(Date),
            },
          },
        },
      }),
    );
  });
});
