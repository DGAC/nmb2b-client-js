import { inspect } from 'util';
import { NMB2BError, createFlightClient } from '../index.js';
import type { SafeB2BDeserializedResponse } from '../types.js';
import { sub, add } from 'date-fns';
import b2bOptions from '../../tests/options.js';
import type { FlightOrFlightPlan as B2BFlight } from './types.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';
import { describe, beforeAll, expect, test, assert } from 'vitest';

describe('queryFlightPlans', async () => {
  const Flight = await createFlightClient(b2bOptions);

  let knownFlight: SafeB2BDeserializedResponse<B2BFlight> | undefined;

  beforeAll(async () => {
    if (!shouldUseRealB2BConnection) {
      return;
    }

    const res = await Flight.queryFlightsByAirspace({
      dataset: { type: 'OPERATIONAL' },
      includeProposalFlights: false,
      includeForecastFlights: false,
      trafficType: 'LOAD',
      trafficWindow: {
        wef: sub(new Date(), { hours: 6 }),
        unt: add(new Date(), { hours: 6 }),
      },
      airspace: 'LFEERMS',
    });

    if (!res.data.flights) {
      return;
    }

    const t = res.data.flights.find((f) => {
      if (!('flight' in f) || !f.flight) {
        return false;
      }

      if (
        f.flight.flightId?.keys?.aircraftId &&
        /(AFR)|(BAW)|(MON)|(EZY)|(RYR)/i.test(f.flight.flightId.keys.aircraftId)
      ) {
        return true;
      }

      return false;
    });

    knownFlight = t;

    if (
      !knownFlight ||
      'flightPlan' in knownFlight ||
      !knownFlight.flight?.flightId?.keys
    ) {
      console.error('Could not find a valid callsign !');
      return;
    }
  });

  test.runIf(shouldUseRealB2BConnection)('query empty callsign', async () => {
    const invalidCallsign = 'ABCDE';

    const res = await Flight.queryFlightPlans({
      aircraftId: invalidCallsign,
      nonICAOAerodromeOfDeparture: false,
      airFiled: false,
      nonICAOAerodromeOfDestination: false,
      estimatedOffBlockTime: {
        wef: sub(new Date(), {
          minutes: 30,
        }),
        unt: add(new Date(), {
          minutes: 30,
        }),
      },
    });

    expect(!!res.data).toBe(false);
  });

  test.runIf(shouldUseRealB2BConnection)('query known flight', async () => {
    try {
      if (!knownFlight || !('flight' in knownFlight) || !knownFlight.flight) {
        return;
      }

      assert(knownFlight.flight.flightId?.keys, 'Invalid flight');

      const res = await Flight.queryFlightPlans({
        aircraftId: knownFlight.flight.flightId.keys.aircraftId,
        nonICAOAerodromeOfDeparture: false,
        airFiled: false,
        nonICAOAerodromeOfDestination: false,
        estimatedOffBlockTime: {
          wef: sub(knownFlight.flight.flightId.keys.estimatedOffBlockTime, {
            minutes: 30,
          }),
          unt: add(knownFlight.flight.flightId.keys.estimatedOffBlockTime, {
            minutes: 30,
          }),
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
      if (err instanceof NMB2BError) {
        console.log(inspect(err, { depth: 4 }));
      }

      throw err;
    }
  });
});
