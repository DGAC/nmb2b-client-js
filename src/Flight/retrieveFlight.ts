import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type { FlightRetrievalReply, FlightRetrievalRequest } from './types.ts';

export const retrieveFlight = createSoapQueryDefinition<
  FlightRetrievalRequest,
  FlightRetrievalReply
>({
  service: 'Flight',
  query: 'retrieveFlight',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .retrieveFlight.input,
});
