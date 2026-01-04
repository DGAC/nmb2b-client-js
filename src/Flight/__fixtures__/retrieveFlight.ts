import { sub, add } from 'date-fns';
import {
  defineFixture,
  expectSnapshot,
} from '../../../tests/utils/fixtures.js';
import { assert } from '../../utils/assert.js';

/**
 * Fixture for testing nominal flight retrieval.
 * Uses setup to find a "live" flight on the B2B API
 * before freezing its keys for offline tests.
 */
export const nominal = defineFixture({
  service: 'Flight',
  method: 'retrieveFlight',
})
  .describe('Nominal retrieval of a flight by its keys')
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
  .run(async (client, variables) => {
    return await client.Flight.retrieveFlight({
      dataset: { type: 'OPERATIONAL' },
      includeProposalFlights: false,
      flightId: {
        keys: variables.keys,
      },
      requestedFlightDatasets: ['flight'],
    });
  })
  .test('should have a valid flight ID', ({ expect, result }) => {
    expect(result.data?.flight?.flightId?.id).toMatch(/^(AA|AT|PO)[0-9]{8}$/);
  })
  .test('should match snapshot', expectSnapshot());
