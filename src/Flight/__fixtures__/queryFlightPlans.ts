import { add, sub } from 'date-fns';
import {
  defineFixture,
  expectRecordedRequests,
  expectSnapshot,
} from '../../../tests/utils/fixtures.ts';
import { assert } from '../../utils/assert.ts';

export const nominal = defineFixture({
  service: 'Flight',
  method: 'queryFlightPlans',
})
  .describe('Nominal queryFlightPlans')
  .setup(async (client) => {
    // Look for a real flight in LFEERMS airspace
    const res = await client.Flight.queryFlightsByAirspace({
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

    const flightData = res.data.flights?.[0];

    assert(
      flightData && 'flight' in flightData && flightData.flight?.flightId?.keys,
      'No flight found for fixture setup',
    );

    return {
      keys: flightData.flight.flightId.keys,
    };
  })
  .run((client, knownFlight, { recordExchange }) =>
    recordExchange('queryFlightPlans', () =>
      client.Flight.queryFlightPlans({
        aircraftId: knownFlight.keys.aircraftId,
        nonICAOAerodromeOfDeparture: false,
        airFiled: false,
        nonICAOAerodromeOfDestination: false,
        estimatedOffBlockTime: {
          wef: sub(knownFlight.keys.estimatedOffBlockTime, {
            minutes: 30,
          }),
          unt: add(knownFlight.keys.estimatedOffBlockTime, {
            minutes: 30,
          }),
        },
      }),
    ),
  )
  .test('should match snapshot', expectSnapshot())
  .test('should send the recorded requests', expectRecordedRequests());
