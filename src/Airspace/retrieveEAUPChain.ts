import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  EAUPChainRetrievalReply,
  EAUPChainRetrievalRequest,
} from './types.js';

export const retrieveEAUPChain = createSoapQueryDefinition<
  EAUPChainRetrievalRequest,
  EAUPChainRetrievalReply
>({
  service: 'Airspace',
  query: 'retrieveEAUPChain',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().AirspaceAvailabilityService.AirspaceAvailabilityPort
      .retrieveEAUPChain.input,
});
