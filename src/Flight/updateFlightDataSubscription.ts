import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  FlightDataSubscriptionUpdateRequest,
  FlightDataSubscriptionUpdateReply,
} from './types.ts';

export const updateFlightDataSubscription = createSoapQueryDefinition<
  FlightDataSubscriptionUpdateRequest,
  FlightDataSubscriptionUpdateReply
>({
  service: 'Flight',
  query: 'updateFlightDataSubscription',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .updateFlightDataSubscription.input,
});
