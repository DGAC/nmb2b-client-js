/* @flow */
import { inspect } from 'util';
import { makeFlightClient } from '../';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { flightPlanToFlightKeys, flightToFlightKeys } from './utils';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const conditionalTest = global.__DISABLE_B2B_CONNECTIONS__ ? test.skip : test;

let Flight;
beforeAll(async () => {
  Flight = await makeFlightClient(b2bOptions);
});

describe('retrieveFlight', () => {
  let knownFlight = {};

  beforeAll(async () => {
    const res = await Flight.queryFlightsByAirspace({
      dataset: { type: 'OPERATIONAL' },
      includeProposalFlights: false,
      includeForecastFlights: false,
      trafficType: 'LOAD',
      trafficWindow: {
        wef: moment
          .utc()
          .subtract(30, 'minutes')
          .toDate(),
        unt: moment
          .utc()
          .add(30, 'minutes')
          .toDate(),
      },
      airspace: 'LFEERMS',
    });

    const flights = res.data.flights.filter(f => {
      if (f.flightPlan) {
        return false;
      }

      return true;
    });

    // Second condition is here because flow won't infer that the array contains
    // only Flight and not FlightPlan anymore
    if (!flights[0] || !flights[0].flight) {
      console.error('Could not fetch a known flight, test aborted');
      return;
    }

    if (!flights[0].flight.flightId.id) {
      console.error('Flight has no ifplId, test aborted');
      return;
    }

    knownFlight.ifplId = flights[0].flight.flightId.id;
    knownFlight.keys = flightToFlightKeys(flights[0].flight);
  });

  conditionalTest('query flightPlan by ifplId', async () => {
    if (!knownFlight.ifplId) {
      return;
    }

    try {
      const res = await Flight.retrieveFlight({
        dataset: {
          type: 'OPERATIONAL',
        },
        includeProposalFlights: false,
        flightId: {
          id: knownFlight.ifplId,
        },
        requestedFlightDatasets: ['flightPlan'],
        requestedDataFormat: 'NM_B2B',
      });

      console.log(inspect(res, { depth: null }));
    } catch (err) {
      console.error(inspect(err, { depth: null }));
      throw err;
    }
  });

  conditionalTest('query flight by flight keys', async () => {
    if (!knownFlight.keys) {
      return;
    }

    try {
      const res = await Flight.retrieveFlight({
        dataset: {
          type: 'OPERATIONAL',
        },
        includeProposalFlights: false,
        flightId: {
          keys: knownFlight.keys,
        },
        requestedFlightDatasets: ['flight'],
        requestedFlightFields: ['aircraftType', 'delay'],
        requestedDataFormat: 'NM_B2B',
      });

      console.log(inspect(res, { depth: null }));
    } catch (err) {
      console.error(inspect(err, { depth: null }));
      throw err;
    }
  });
});
