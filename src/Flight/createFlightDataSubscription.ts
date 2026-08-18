import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  FlightDataSubscriptionCreationRequest,
  FlightDataSubscriptionCreationReply,
} from './types.ts';

export const createFlightDataSubscription = createSoapQueryDefinition<
  FlightDataSubscriptionCreationRequest,
  FlightDataSubscriptionCreationReply
>({
  service: 'Flight',
  query: 'createFlightDataSubscription',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .createFlightDataSubscription.input,
});
