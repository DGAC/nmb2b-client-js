import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  AUPChainRetrievalReply,
  AUPChainRetrievalRequest,
} from './types.js';

export const retrieveAUPChain = createSoapQueryDefinition<
  AUPChainRetrievalRequest,
  AUPChainRetrievalReply
>({
  service: 'Airspace',
  query: 'retrieveAUPChain',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().AirspaceAvailabilityService.AirspaceAvailabilityPort
      .retrieveAUPChain.input,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  executeQuery: (client) => client.retrieveAUPChainAsync,
});
