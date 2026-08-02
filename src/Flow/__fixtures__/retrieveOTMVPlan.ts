import { startOfMinute } from 'date-fns';
import { assert } from 'vitest';
import {
  defineFixture,
  expectSnapshot,
} from '../../../tests/utils/fixtures.ts';

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
    });
  })
  .run(async (client, { day, dataset, trafficVolumes }) => {
    const res = await client.Flow.retrieveOTMVPlan({
      dataset,
      day,
      otmvsWithDuration: {
        item: trafficVolumes.map((trafficVolume) => ({ trafficVolume })),
      },
    });

    return res;
  })
  .test('should match snapshot', expectSnapshot())
  .test(
    'should contain otmv plans for request traffic volumes',
    ({ expect, result, variables }) => {
      const otmvPlans = result.data.plans;
      assert(otmvPlans);

      const responseTrafficVolumes = otmvPlans.tvsOTMVs?.item?.map(
        ({ key }) => key,
      );

      expect(responseTrafficVolumes).toEqual(variables.trafficVolumes);
    },
  );
