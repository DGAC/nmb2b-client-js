import { add, sub } from 'date-fns';
import { describe, expect, test } from 'vitest';

import { TEST_B2B_OPTIONS } from '../../../tests/options.ts';
import { shouldUseRealB2BConnection } from '../../../tests/utils.ts';
import { createFlightClient } from '../../index.ts';

/**
 * B2B validates requests against the XSD and rejects elements out of sequence order
 * (`INVALID_INPUT`, `cvc-complex-type.2.4.d`), so the serializer reorders keys at every level.
 *
 * This test exists because `soap` only partially does it: since v1.12 it orders the top level of
 * the request, but nested elements declared with a named type (`type="common:…"`, most of the B2B
 * XSD) keep the input key order (checked with soap v1.14.0). Unit tests replay recorded requests
 * byte for byte, so they catch a change in the order sent, but only B2B can tell whether that order
 * is valid.
 *
 * `queryFlightsByAirspace` is only the carrier: read-only, cheap, with a nested `trafficWindow`.
 */
describe('serializer, validated by B2B', async () => {
  const Flight = await createFlightClient(TEST_B2B_OPTIONS);

  test.runIf(shouldUseRealB2BConnection)(
    'nested keys given out of XSD order are sent in XSD order',
    async () => {
      const res = await Flight.queryFlightsByAirspace({
        airspace: 'LFEERMS',
        // XSD order is `wef`, `unt`
        trafficWindow: {
          unt: add(new Date(), { minutes: 10 }),
          wef: sub(new Date(), { minutes: 10 }),
        },
        trafficType: 'LOAD',
        includeForecastFlights: false,
        includeProposalFlights: false,
        dataset: { type: 'OPERATIONAL' },
      });

      expect(res.status).toBe('OK');
    },
  );
});
