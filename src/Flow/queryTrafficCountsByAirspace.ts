import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  TrafficCountsByAirspaceRequest,
  TrafficCountsByAirspaceReply,
} from './types.ts';

export const queryTrafficCountsByAirspace = createSoapQueryDefinition<
  TrafficCountsByAirspaceRequest,
  TrafficCountsByAirspaceReply
>({
  service: 'Flow',
  query: 'queryTrafficCountsByAirspace',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().TrafficCountsService.TrafficCountsPort
      .queryTrafficCountsByAirspace.input,
});
