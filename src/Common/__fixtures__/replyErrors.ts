import { add, startOfMinute } from 'date-fns';

import { defineFixture, expectRecordedRequests } from '../../../tests/utils/fixtures.ts';
import { assert } from '../../utils/assert.ts';
import { NMB2BError } from '../../utils/NMB2BError.ts';

/**
 * Reply errors, as NM sends them. `queryFlightsByAirspace` is only a cheap way to get one.
 */
export const invalidTrafficWindow = defineFixture({
  service: 'Flight',
  method: 'queryFlightsByAirspace',
})
  .describe('INVALID_INPUT reply to a traffic window outside the range NM serves')
  .setup(() => {
    const wef = add(startOfMinute(new Date()), { days: 30 });
    return Promise.resolve({ wef, unt: add(wef, { hours: 1 }) });
  })
  .run((client, { wef, unt }, { recordExchange }) =>
    recordExchange('queryFlightsByAirspace', async () => {
      try {
        await client.Flight.queryFlightsByAirspace({
          dataset: { type: 'OPERATIONAL' },
          includeProposalFlights: false,
          includeForecastFlights: false,
          trafficType: 'LOAD',
          trafficWindow: { wef, unt },
          airspace: 'LFEERMS',
        });
      } catch (error) {
        // Only the expected error is recorded: any other one is rethrown and records no exchange.
        if (error instanceof NMB2BError && error.status === 'INVALID_INPUT') {
          return error;
        }

        throw error;
      }

      throw new Error('queryFlightsByAirspace should reply INVALID_INPUT');
    }),
  )
  .test('should send the recorded requests', expectRecordedRequests())
  .test('should reply INVALID_INPUT', ({ expect, result }) => {
    expect(result.status).toBe('INVALID_INPUT');
  })
  .test('should expose the attributes as an item list', ({ expect, result }) => {
    const [error] = result.inputValidationErrors ?? [];
    assert(error, 'result.inputValidationErrors should not be empty');

    expect(error.attributes?.item).toEqual(['dataset', 'trafficWindow']);
  })
  .test('should expose the parameters as key/value items', ({ expect, result }) => {
    const [error] = result.inputValidationErrors ?? [];
    assert(error, 'result.inputValidationErrors should not be empty');

    expect(error.parameters?.item).toEqual([
      { key: 'CONSTRAINT', value: expect.stringMatching(/^trafficWindow: not in range \[/) },
    ]);
  });
