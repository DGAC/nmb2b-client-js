import { startOfMinute } from 'date-fns';

import {
  defineFixture,
  expectRecordedRequests,
  expectSnapshot,
} from '../../../tests/utils/fixtures.ts';
import { assert } from '../../utils/assert.ts';

export const nominal = defineFixture({
  service: 'Flow',
  method: 'retrieveOTMVPlan',
})
  .describe('nominal retrieveOTMVPlan request')
  .setup(() => {
    const now = startOfMinute(new Date());

    return Promise.resolve({
      dataset: { type: 'OPERATIONAL' as const },
      day: now,
      trafficVolumes: ['LFEKD', 'LFEUH'],
      otmvDuration: 11 * 60,
    });
  })
  .run((client, { day, dataset, trafficVolumes, otmvDuration }, { recordExchange }) =>
    recordExchange('retrieveOTMVPlan', () =>
      client.Flow.retrieveOTMVPlan({
        dataset,
        day,
        otmvsWithDuration: {
          item: trafficVolumes.map((trafficVolume) => ({ trafficVolume, otmvDuration })),
        },
      }),
    ),
  )
  .test('should match snapshot', expectSnapshot())
  .test('should send the recorded requests', expectRecordedRequests())
  .test(
    'should contain otmv plans for request traffic volumes',
    ({ expect, result, variables }) => {
      const otmvPlans = result.data.plans;
      assert(otmvPlans);

      const responseTrafficVolumes = otmvPlans.tvsOTMVs?.item?.map(({ key }) => key);

      expect(responseTrafficVolumes).toEqual(variables.trafficVolumes);
    },
  )
  .test('should only contain otmvs of the requested duration', ({ expect, result, variables }) => {
    const otmvPlans = result.data.plans;
    assert(otmvPlans);

    for (const { value } of otmvPlans.tvsOTMVs?.item ?? []) {
      expect(value?.item?.map(({ key }) => key)).toEqual([variables.otmvDuration]);
    }
  });
