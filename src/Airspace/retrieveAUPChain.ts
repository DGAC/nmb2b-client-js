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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().AirspaceAvailabilityService.AirspaceAvailabilityPort
      .retrieveAUPChain.input,
});
