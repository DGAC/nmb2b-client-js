import { inspect } from 'util';
import { describe, expect, test } from 'vitest';
import { NMB2BError, makeFlowClient } from '..';
import b2bOptions from '../../tests/options';
import { shouldUseRealB2BConnection } from '../../tests/utils';
import type { RegulationListReply } from './queryRegulations';
import { extractReferenceLocation } from '../utils/extractReferenceLocation';
import { add, startOfHour, sub } from 'date-fns';

describe('queryRegulations', async () => {
  const Flow = await makeFlowClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('List all regulations', async () => {
    try {
      const res: RegulationListReply = await Flow.queryRegulations({
        dataset: { type: 'OPERATIONAL' },
        queryPeriod: {
          wef: startOfHour(sub(new Date(), { hours: 10 })),
          unt: startOfHour(add(new Date(), { hours: 10 })),
        },
        requestedRegulationFields: {
          item: [
            'applicability',
            'location',
            'reason',
            'linkedRegulations',
            'scenarioReference',
          ],
        },
      });

      const items = res.data.regulations.item;

      expect(items).toBeDefined();
      expect(items.length).toBeGreaterThanOrEqual(1);

      for (const item of items) {
        expect(item.regulationId).toBeDefined();

        const protectedLocation = extractReferenceLocation(
          'protectedLocation',
          item,
        );

        if (protectedLocation) {
          switch (protectedLocation.type) {
            case 'AIRSPACE':
            case 'AERODROME':
            case 'AERODROME_SET':
            case 'DBE_POINT':
            case 'PUBLISHED_POINT': {
              expect(protectedLocation).toMatchObject({
                id: expect.any(String),
              });
              break;
            }
            default: {
              protectedLocation satisfies never;
            }
          }
        }

        const referenceLocation = extractReferenceLocation(
          'referenceLocation',
          item.location,
        );

        if (referenceLocation) {
          switch (referenceLocation.type) {
            case 'AIRSPACE':
            case 'AERODROME':
            case 'AERODROME_SET':
            case 'DBE_POINT':
            case 'PUBLISHED_POINT': {
              expect(referenceLocation).toMatchObject({
                id: expect.any(String),
              });
              break;
            }
            default: {
              referenceLocation satisfies never;
            }
          }
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
