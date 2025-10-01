import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  TrafficCountsByAirspaceRequest,
  TrafficCountsByAirspaceReply,
} from './types.js';

export const queryTrafficCountsByAirspace = createSoapQueryDefinition<
  TrafficCountsByAirspaceRequest,
  TrafficCountsByAirspaceReply
>({
  service: 'Flow',
  query: 'queryTrafficCountsByAirspace',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().TrafficCountsService.TrafficCountsPort
      .queryTrafficCountsByAirspace.input,
});
