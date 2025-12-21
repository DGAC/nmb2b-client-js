import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  TrafficCountsByTrafficVolumeRequest,
  TrafficCountsByTrafficVolumeReply,
} from './types.ts';

export const queryTrafficCountsByTrafficVolume = createSoapQueryDefinition<
  TrafficCountsByTrafficVolumeRequest,
  TrafficCountsByTrafficVolumeReply
>({
  service: 'Flow',
  query: 'queryTrafficCountsByTrafficVolume',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().TrafficCountsService.TrafficCountsPort
      .queryTrafficCountsByTrafficVolume.input,
});
