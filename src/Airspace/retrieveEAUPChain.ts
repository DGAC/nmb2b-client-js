import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  EAUPChainRetrievalReply,
  EAUPChainRetrievalRequest,
} from './types.ts';

export const retrieveEAUPChain = createSoapQueryDefinition<
  EAUPChainRetrievalRequest,
  EAUPChainRetrievalReply
>({
  service: 'Airspace',
  query: 'retrieveEAUPChain',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().AirspaceAvailabilityService.AirspaceAvailabilityPort
      .retrieveEAUPChain.input,
});
