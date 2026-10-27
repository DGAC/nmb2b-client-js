import { add, startOfMinute, sub } from 'date-fns';

import {
  defineFixture,
  expectRecordedRequests,
  expectSnapshot,
} from '../../../tests/utils/fixtures.ts';
import { assert } from '../../utils/assert.ts';

/**
 * Fixture for testing queryFlightsByAirspace.
 */
export const nominal = defineFixture({
  service: 'Flight',
  method: 'queryFlightsByAirspace',
})
  .describe('Nominal query of flights by airspace (LFEERMS)')
  .setup(() => {
    const now = startOfMinute(new Date());
    return Promise.resolve({
      wef: sub(now, { minutes: 30 }),
      unt: add(now, { minutes: 30 }),
    });
  })
  .run((client, { wef, unt }, { recordExchange }) =>
    recordExchange('queryFlightsByAirspace', () =>
      client.Flight.queryFlightsByAirspace({
        dataset: { type: 'OPERATIONAL' },
        includeProposalFlights: false,
        includeForecastFlights: false,
        trafficType: 'LOAD',
        trafficWindow: { wef, unt },
        airspace: 'LFEERMS',
      }),
    ),
  )
  .test('should match snapshot', expectSnapshot())
  .test('should send the recorded requests', expectRecordedRequests())
  .test('should return a matching traffic window', ({ expect, result, variables }) => {
    assert(
      result.data.effectiveTrafficWindow,
      'result.data.effectiveTrafficWindow should be defined',
    );

    const { wef, unt } = result.data.effectiveTrafficWindow;

    expect(wef).toEqual(variables.wef);
    expect(unt).toEqual(variables.unt);
  })
  .test('should return a non-empty list of flights', ({ expect, result }) => {
    assert(result.data.flights, 'result.data should be defined');

    const { flights } = result.data;
    expect(flights.length).toBeGreaterThan(0);

    for (const flight of flights) {
      expect(flight).toEqual({
        flight: {
          flightId: {
            id: expect.stringMatching(/^(AA|AT|PO)\d+/),
            keys: {
              aerodromeOfDeparture: expect.toBeOneOf([null, expect.stringMatching(/[A-Z]{4}/)]),
              aerodromeOfDestination: expect.toBeOneOf([null, expect.stringMatching(/[A-Z]{4}/)]),
              nonICAOAerodromeOfDeparture: false,
              nonICAOAerodromeOfDestination: false,
              aircraftId: expect.stringMatching(/[A-Z0-9]+/),
              airFiled: expect.any(Boolean),
              estimatedOffBlockTime: expect.any(Date),
            },
          },
        },
      });
    }
  });
