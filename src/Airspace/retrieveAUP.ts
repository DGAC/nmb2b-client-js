import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type { AUPRetrievalReply, AUPRetrievalRequest } from './types.ts';

export const retrieveAUP = createSoapQueryDefinition<
  AUPRetrievalRequest,
  AUPRetrievalReply
>({
  service: 'Airspace',
  query: 'retrieveAUP',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().AirspaceAvailabilityService.AirspaceAvailabilityPort
      .retrieveAUP.input,
});
