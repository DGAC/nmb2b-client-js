import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type { AUPRetrievalReply, AUPRetrievalRequest } from './types.ts';

export const retrieveAUP = createSoapQueryDefinition<
  AUPRetrievalRequest,
  AUPRetrievalReply
>({
  service: 'Airspace',
  query: 'retrieveAUP',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().AirspaceAvailabilityService.AirspaceAvailabilityPort
      .retrieveAUP.input,
});
