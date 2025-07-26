import { add, startOfHour, sub } from 'date-fns';
import { inspect } from 'util';
import { assert, describe, expect, test } from 'vitest';
import b2bOptions from '../../tests/options.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';
import { NMB2BError, createFlowClient } from '../index.js';
import { extractReferenceLocation } from '../utils/extractReferenceLocation.js';
import type { RegulationListReply } from './queryRegulations.js';

describe('queryRegulations', async () => {
  const Flow = await createFlowClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('empty regulation lists', async () => {
    try {
      const res = await Flow.queryRegulations({
        dataset: { type: 'OPERATIONAL' },
        regulations: {
          item: ['LFZZ*'],
        },
        queryPeriod: {
          wef: sub(new Date(), { minutes: 1 }),
          unt: add(new Date(), { minutes: 1 }),
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

      console.log(inspect(res, { depth: 6 }));

      expect(res.data.regulations).toBe(null);
    } catch (err) {
      if (err instanceof NMB2BError) {
        console.log(inspect(err, { depth: 4 }));
      }

      throw err;
    }
  });

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

      const items = res.data.regulations?.item;

      assert(items);

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
