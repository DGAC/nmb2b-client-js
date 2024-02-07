import { inspect } from 'util';
import { NMB2BError, makeFlightClient } from '..';
import { sub, add } from 'date-fns';
import b2bOptions from '../../tests/options';
import { FlightOrFlightPlan as B2BFlight } from './types';
import { shouldUseRealB2BConnection } from '../../tests/utils';
import { describe, beforeAll, expect, test } from 'vitest';

describe('queryFlightPlans', async () => {
  const Flight = await makeFlightClient(b2bOptions);

  let knownFlight: B2BFlight | undefined;

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

  test.runIf(shouldUseRealB2BConnection)('query known flight', async () => {
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
          wef: sub(knownFlight.flight.flightId.keys?.estimatedOffBlockTime!, {
            minutes: 30,
          }),
          unt: add(knownFlight.flight.flightId.keys?.estimatedOffBlockTime!, {
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
