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
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().TrafficCountsService.TrafficCountsPort
      .queryTrafficCountsByTrafficVolume.input,
});
