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
    });
  })
  .run((client, { day, dataset, trafficVolumes }, { recordExchange }) =>
    recordExchange('retrieveOTMVPlan', () =>
      client.Flow.retrieveOTMVPlan({
        dataset,
        day,
        otmvsWithDuration: {
          item: trafficVolumes.map((trafficVolume) => ({ trafficVolume })),
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
  );
