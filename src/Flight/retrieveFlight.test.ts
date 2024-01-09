import { inspect } from 'util';
import { NMB2BError, makeFlightClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import type { FlightKeys } from './types';
import { shouldUseRealB2BConnection } from '../../tests/utils';
import { expect, beforeAll, test, describe } from 'vitest';

describe('retrieveFlight', async () => {
  const Flight = await makeFlightClient(b2bOptions);

  let knownFlight: {
    ifplId: string;
    keys: FlightKeys;
  };

  beforeAll(async () => {
    const res = await Flight.queryFlightsByAirspace({
      dataset: { type: 'OPERATIONAL' },
      includeProposalFlights: false,
      includeForecastFlights: false,
      trafficType: 'LOAD',
      trafficWindow: {
        wef: moment.utc().subtract(30, 'minutes').toDate(),
        unt: moment.utc().add(30, 'minutes').toDate(),
      },
      airspace: 'LFEERMS',
    });

    const flights = res.data.flights.filter((f) => {
      if ('flightPlan' in f) {
        return false;
      }

      return true;
    });

    // Second condition is here because TS won't infer that the array contains
    // only Flight and not FlightPlan anymore
    const flight = flights[0];
    if (!flight || !('flight' in flight)) {
      console.error('Could not fetch a known flight, test aborted');
      return;
    }

    if (!flight.flight.flightId.id) {
      console.error('Flight has no ifplId, test aborted');
      return;
    }

    if (!flight.flight.flightId.keys) {
      console.error('Flight has no flight keys, test aborted');
      return;
    }

    knownFlight = {
      ifplId: flight.flight.flightId.id,
      keys: flight.flight.flightId.keys,
    };
  });

  test.runIf(shouldUseRealB2BConnection)(
    'query flightPlan by ifplId',
    async () => {
      if (!knownFlight.ifplId || !knownFlight.keys) {
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
          requestedFlightFields: ['ftfmPointProfile'],
        });

        expect(res.data.flight?.ftfmPointProfile).toBeDefined();
        res.data.flight?.ftfmPointProfile?.forEach((item) => {
          expect(item).toEqual(
            expect.objectContaining({
              timeOver: expect.any(Date),
              coveredDistance: expect.any(Number),
            }),
          );
        });
      } catch (err) {
        console.error(inspect(err, { depth: 4 }));
        throw err;
      }
    },
  );

  test.runIf(shouldUseRealB2BConnection)(
    'query flight by flight keys',
    async () => {
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
        });

        const flight = res.data?.flight;
        expect(flight).toBeDefined();
        expect(flight?.flightId.id).toEqual(
          expect.stringMatching(/^A(A|T)[0-9]{8}$/),
        );

        if (flight?.delay !== undefined) {
          expect(flight?.delay).toBeGreaterThanOrEqual(0);
        }

        expect(flight?.aircraftType).toEqual(
          expect.stringMatching(/^[A-Z0-9]{4}$/),
        );
      } catch (err) {
        if (err instanceof NMB2BError) {
          console.log(inspect(err, { depth: 4 }));
        }

        throw err;
      }
    },
  );
});
