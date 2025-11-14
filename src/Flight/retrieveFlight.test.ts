import { add, sub } from 'date-fns';
import { inspect } from 'util';
import { assert, beforeAll, describe, expect, test } from 'vitest';
import b2bOptions from '../../tests/options.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';
import { createFlightClient, NMB2BError } from '../index.js';
import type { SafeB2BDeserializedResponse } from '../types.js';
import type { FlightKeys } from './types.js';

describe('retrieveFlight', async () => {
  const Flight = await createFlightClient(b2bOptions);

  let knownFlight:
    | {
        ifplId: string;
        keys: SafeB2BDeserializedResponse<FlightKeys>;
      }
    | undefined;

  beforeAll(async () => {
    const res = await Flight.queryFlightsByAirspace({
      dataset: { type: 'OPERATIONAL' },
      includeProposalFlights: false,
      includeForecastFlights: false,
      trafficType: 'LOAD',
      trafficWindow: {
        wef: sub(new Date(), { minutes: 30 }),
        unt: add(new Date(), { minutes: 30 }),
      },
      airspace: 'LFEERMS',
    });

    if (!res.data.flights) {
      console.warn('No flights in the response.');
      return;
    }

    const flights = res.data.flights.filter(
      (f): f is Extract<typeof f, { flight: any }> => {
        if ('flightPlan' in f || !f.flight) {
          return false;
        }

        return true;
      },
    );

    const flight = flights[0];

    if (!flight?.flight) {
      console.error('Could not fetch a known flight, test aborted');
      return;
    }

    if (!flight.flight.flightId?.id) {
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
      if (!knownFlight) {
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

        assert(res.data?.flight?.ftfmPointProfile);

        res.data.flight.ftfmPointProfile.forEach((item) => {
          expect(item).toEqual(
            expect.objectContaining({
              timeOver: expect.any(Date),
              coveredDistance: expect.any(Number),
            }),
          );
        });
      } catch (err) {
        if (err instanceof NMB2BError) {
          console.log(inspect(err, { depth: 4 }));
        }

        throw err;
      }
    },
  );

  test.runIf(shouldUseRealB2BConnection)(
    'query flight by flight keys',
    async () => {
      if (!knownFlight) {
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
        expect(flight?.flightId?.id).toEqual(
          expect.stringMatching(/^(AA|AT|PO)[0-9]{8}$/),
        );

        if (flight?.delay !== undefined) {
          expect(flight.delay).toBeGreaterThanOrEqual(0);
        }

        expect(flight?.aircraftType).toEqual(
          expect.stringMatching(/^[A-Z0-9]{2,4}$/),
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
