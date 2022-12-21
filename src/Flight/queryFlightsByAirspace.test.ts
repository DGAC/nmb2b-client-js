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

describe('queryFlightsByAirspace', () => {
  conditionalTest('query in LFEERMS', async () => {
    const res = await Flight.queryFlightsByAirspace({
      dataset: { type: 'OPERATIONAL' },
      includeProposalFlights: false,
      includeForecastFlights: false,
      trafficType: 'LOAD',
      trafficWindow: {
        wef: moment.utc().subtract(10, 'minutes').toDate(),
        unt: moment.utc().add(10, 'minutes').toDate(),
      },
      airspace: 'LFEERMS',
    });

    const {
      data: { flights },
    } = res;

    expect(Array.isArray(flights)).toBe(true);

    flights.forEach((flight) =>
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
