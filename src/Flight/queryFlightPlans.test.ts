import { inspect } from 'util';
import { makeFlightClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { FlightService } from '.';
import { FlightOrFlightPlan as B2BFlight } from './types';
import { JestAssertionError } from 'expect';

jest.setTimeout(20000);

const conditionalTest = (global as any).__DISABLE_B2B_CONNECTIONS__
  ? test.skip
  : test;

let Flight: FlightService;
beforeAll(async () => {
  Flight = await makeFlightClient(b2bOptions);
});

describe('queryFlightPlans', () => {
  let knownFlight: B2BFlight | undefined;

  beforeAll(async () => {
    const res = await Flight.queryFlightsByAirspace({
      dataset: { type: 'OPERATIONAL' },
      includeProposalFlights: false,
      includeForecastFlights: false,
      trafficType: 'LOAD',
      trafficWindow: {
        wef: moment.utc().subtract(6, 'hours').toDate(),
        unt: moment.utc().add(6, 'hours').toDate(),
      },
      airspace: 'LFEERMS',
    });

    if (!res.data.flights) {
      return;
    }

    knownFlight = res.data.flights.find((f) => {
      if (!('flight' in f)) {
        return false;
      }

      const { flight } = f;

      if (
        flight.flightId?.keys?.aircraftId &&
        /(AFR)|(BAW)|(MON)|(EZY)|(RYR)/i.test(flight.flightId.keys.aircraftId)
      ) {
        return true;
      }

      return false;
    });

    if (
      !knownFlight ||
      'flightPlan' in knownFlight ||
      !knownFlight.flight.flightId.keys
    ) {
      console.error('Could not find a valid callsign !');
      return;
    }
  });

  conditionalTest('query known flight', async () => {
    try {
      if (!knownFlight || !('flight' in knownFlight)) {
        return;
      }

      const res = await Flight.queryFlightPlans({
        aircraftId: knownFlight.flight.flightId.keys?.aircraftId,
        nonICAOAerodromeOfDeparture: false,
        airFiled: false,
        nonICAOAerodromeOfDestination: false,
        estimatedOffBlockTime: {
          wef: moment
            .utc(knownFlight.flight.flightId.keys?.estimatedOffBlockTime!)
            .subtract(30, 'minutes')
            .toDate(),
          unt: moment
            .utc(knownFlight.flight.flightId.keys?.estimatedOffBlockTime!)
            .add(30, 'minutes')
            .toDate(),
        },
      });

      const { data } = res;

      if (!data?.summaries || data.summaries.length === 0) {
        console.error(
          'Query did not return any flight plan, this should never happen.',
        );
        return;
      }

      for (const f of data.summaries) {
        if (!('lastValidFlightPlan' in f || 'currentInvalid' in f)) {
          throw new Error(
            'queryFlightPlans: either lastValidFlightPlan or currentInvalid should exist',
          );
        }

        if ('lastValidFlightPlan' in f) {
          expect(f.lastValidFlightPlan).toMatchObject({
            id: {
              id: expect.any(String),
              keys: {
                aircraftId: expect.any(String),
                aerodromeOfDeparture: expect.any(String),
                aerodromeOfDestination: expect.any(String),
                estimatedOffBlockTime: expect.any(Date),
              },
            },
            status: expect.any(String),
          });
        } else if ('currentInvalid' in f) {
          console.warn(
            'Query returned a flight with a currentInvalid property',
          );
        }
      }
    } catch (err) {
      if (err instanceof JestAssertionError) {
        throw err;
      }

      console.log(inspect(err, { depth: 4 }));
      throw err;
    }
  });
});
