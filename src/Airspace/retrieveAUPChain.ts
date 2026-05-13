import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  AUPChainRetrievalReply,
  AUPChainRetrievalRequest,
} from './types.ts';

export const retrieveAUPChain = createSoapQueryDefinition<
  AUPChainRetrievalRequest,
  AUPChainRetrievalReply
>({
  service: 'Airspace',
  query: 'retrieveAUPChain',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().AirspaceAvailabilityService.AirspaceAvailabilityPort
      .retrieveAUPChain.input,
});
