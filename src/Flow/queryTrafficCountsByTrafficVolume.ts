import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  TrafficCountsByTrafficVolumeRequest,
  TrafficCountsByTrafficVolumeReply,
} from './types.js';

export const queryTrafficCountsByTrafficVolume = createSoapQueryDefinition<
  TrafficCountsByTrafficVolumeRequest,
  TrafficCountsByTrafficVolumeReply
>({
  service: 'Flow',
  query: 'queryTrafficCountsByTrafficVolume',
  getSchema: (client) =>
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().TrafficCountsService.TrafficCountsPort
      .queryTrafficCountsByTrafficVolume.input,
});
