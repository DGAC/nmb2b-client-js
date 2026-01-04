import { add, startOfMinute, sub } from 'date-fns';
import { assert } from 'vitest';
import {
  defineFixture,
  expectSnapshot,
} from '../../../tests/utils/fixtures.js';

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
      wef: sub(now, { minutes: 30 }).toISOString(),
      unt: add(now, { minutes: 30 }).toISOString(),
    });
  })
  .run(async (client, variables) => {
    return await client.Flight.queryFlightsByAirspace({
      dataset: { type: 'OPERATIONAL' },
      includeProposalFlights: false,
      includeForecastFlights: false,
      trafficType: 'LOAD',
      trafficWindow: {
        wef: new Date(variables.wef),
        unt: new Date(variables.unt),
      },
      airspace: 'LFEERMS',
    });
  })
  .test('should match snapshot', expectSnapshot())
  .test(
    'should return a matching traffic window',
    ({ expect, result, variables }) => {
      assert(
        result.data.effectiveTrafficWindow,
        'result.data.effectiveTrafficWindow should be defined',
      );

      const { wef, unt } = result.data.effectiveTrafficWindow;

      expect(new Date(wef)).toEqual(new Date(variables.wef));
      expect(new Date(unt)).toEqual(new Date(variables.unt));
    },
  )
  .test('should return a non-empty list of flights', ({ expect, result }) => {
    assert(result.data.flights, 'result.data should be defined');

    const { flights } = result.data;
    expect(flights.length).toBeGreaterThan(0);

    for (const flight of flights) {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      expect(flight).toEqual({
        flight: {
          flightId: {
            id: expect.stringMatching(/^(AA|AT|PO)\d+/),
            keys: {
              aerodromeOfDeparture: expect.toBeOneOf([
                null,
                expect.stringMatching(/[A-Z]{4}/),
              ]),
              aerodromeOfDestination: expect.toBeOneOf([
                null,
                expect.stringMatching(/[A-Z]{4}/),
              ]),
              nonICAOAerodromeOfDeparture: false,
              nonICAOAerodromeOfDestination: false,
              aircraftId: expect.stringMatching(/[A-Z0-9]+/),
              airFiled: expect.any(Boolean),
              estimatedOffBlockTime: expect.any(Date),
            },
          },
        },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    }
  });
