import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  FlightDataSubscriptionRetrievalRequest,
  FlightDataSubscriptionRetrievalReply,
} from './types.ts';

export const retrieveFlightDataSubscription = createSoapQueryDefinition<
  FlightDataSubscriptionRetrievalRequest,
  FlightDataSubscriptionRetrievalReply
>({
  service: 'Flight',
  query: 'retrieveFlightDataSubscription',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .retrieveFlightDataSubscription.input,
});
