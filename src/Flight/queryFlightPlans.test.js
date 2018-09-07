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

describe('queryFlightPlans', () => {
  let knownCallsign;

  beforeAll(async () => {
    const res = await Flight.queryFlightsByAirspace({
      dataset: { type: 'OPERATIONAL' },
      includeProposalFlights: false,
      includeForecastFlights: false,
      trafficType: 'LOAD',
      trafficWindow: {
        wef: moment
          .utc()
          .add(2, 'hours')
          .toDate(),
        unt: moment
          .utc()
          .add(4, 'hours')
          .toDate(),
      },
      airspace: 'LFEERMS',
    });

    // $FlowFixMe
    if (!res.data.flights) {
      return;
    }

    const knownFlight = res.data.flights.find(({ flight }) => {
      if (
        flight &&
        flight.flightId &&
        flight.flightId.keys &&
        /(AFR)|(BAW)|(MON)|(EZY)/i.test(flight.flightId.keys.aircraftId)
      ) {
        return true;
      }

      return false;
    });

    if (!knownFlight) {
      console.error('Could not find a valid callsign !');
      return;
    }

    knownCallsign = knownFlight.flight.flightId.keys.aircraftId;
  });

  conditionalTest('query known flight', async () => {
    const res = await Flight.queryFlightPlans({
      aircraftId: knownCallsign,
      nonICAOAerodromeOfDeparture: false,
      airFiled: false,
      nonICAOAerodromeOfDestination: false,
      estimatedOffBlockTime: {
        wef: moment
          .utc()
          .subtract(12, 'hours')
          .toDate(),
        unt: moment
          .utc()
          .add(12, 'hours')
          .toDate(),
      },
    });

    const { data } = res;

    if (data.summaries.length === 0) {
      console.error(
        'Query did not return any flight plan, this should never happen.',
      );
      return;
    }

    data.summaries.forEach(f => {
      if (!(f.lastValidFlightPlan || f.currentInvalid)) {
        throw new Error(
          'queryFlightPlans: either lastValidFlightPlan or currentInvalid should exist',
        );
      }

      if (f.lastValidFlightPlan) {
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
      } else if (f.currentInvalid) {
        console.warn(
          'Query returned a flight without a lastValidFlightPlan property',
        );
      }
    });
  });
});
