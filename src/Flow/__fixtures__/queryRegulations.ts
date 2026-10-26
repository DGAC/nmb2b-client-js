import { add, areIntervalsOverlapping, startOfMinute, sub } from 'date-fns';
import {
  defineFixture,
  expectRecordedRequests,
  expectSnapshot,
} from '../../../tests/utils/fixtures.ts';
import { assert } from '../../utils/assert.ts';
import { extractReferenceLocation } from '../../utils/extractReferenceLocation.ts';

export const nominal = defineFixture({
  service: 'Flow',
  method: 'queryRegulations',
})
  .describe('Nominal regulation query')
  .setup(() => {
    const now = startOfMinute(new Date());

    return Promise.resolve({
      dataset: { type: 'OPERATIONAL' as const },
      queryPeriod: {
        wef: sub(now, { hours: 1 }),
        unt: add(now, { hours: 1 }),
      },
    });
  })
  .run(async (client, { queryPeriod, dataset }, { recordExchange }) => {
    assert(queryPeriod);

    const exchange = await recordExchange('queryRegulations', () =>
      client.Flow.queryRegulations({
        dataset,
        queryPeriod,
        requestedRegulationFields: {
          item: [
            'applicability',
            'location',
            'protectedLocation',
            'reason',
            'linkedRegulations',
            'scenarioReference',
            'regulationState',
          ],
        },
      }),
    );

    assertRegulationArray(exchange.result.data.regulations?.item);

    return exchange;
  })
  .test('should match snapshot', expectSnapshot())
  .test('should send the recorded requests', expectRecordedRequests())
  .test(
    'should return regulations applicable in the correct applicability interval',
    ({ expect, result, variables }) => {
      const regulations = result.data.regulations?.item;
      assertRegulationArray(regulations);

      for (const regulation of regulations) {
        assert(regulation.applicability, 'Regulation must have an applicability period');

        expect(
          areIntervalsOverlapping(
            {
              start: regulation.applicability.wef,
              end: regulation.applicability.unt,
            },
            {
              start: variables.queryPeriod.wef,
              end: variables.queryPeriod.unt,
            },
          ),
        ).toBe(true);
      }
    },
  )
  .test('should return parseable referenceLocation and protectedLocation', ({ expect, result }) => {
    const regulations = result.data.regulations?.item;
    assertRegulationArray(regulations);

    const referenceLocationMatcher = {
      type: expect.toBeOneOf(['AERODROME', 'AIRSPACE', 'AERODROME_SET', 'PUBLISHED_POINT']),
      id: expect.stringMatching(/^[^\s]+$/),
    };

    for (const regulation of regulations) {
      assert(regulation.location, 'regulation location must exist');

      const regulationLocation = extractReferenceLocation('referenceLocation', regulation.location);

      expect(regulationLocation).toEqual(referenceLocationMatcher);

      const protectedLocation = extractReferenceLocation('protectedLocation', regulation);

      expect(protectedLocation).toEqual(expect.toBeOneOf([undefined, referenceLocationMatcher]));
    }
  })
  .test('should return a matching dataset type', ({ expect, result, variables }) => {
    expect(result.data.dataset.type).toEqual(variables.dataset.type);
  });

function assertRegulationArray<T>(
  regulations: Array<T> | undefined | null,
): asserts regulations is Array<T> {
  assert(
    Array.isArray(regulations),
    '`regulations` must be an array. If this fails, the regulation list might be empty.',
  );
}
