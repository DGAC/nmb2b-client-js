import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  SubscriptionSynchronisationRequest,
  SubscriptionSynchronisationReply,
} from './types.ts';

export const synchroniseSubscription = createSoapQueryDefinition<
  SubscriptionSynchronisationRequest,
  SubscriptionSynchronisationReply
>({
  service: 'Common',
  query: 'synchroniseSubscription',
  getSchema: (client) => {
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    return client.describe().SubscriptionManagementService
      .SubscriptionManagementPort.synchroniseSubscription.input;
  },
});
