import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  SubscriptionHistoryRequest,
  SubscriptionHistoryReply,
} from './types.ts';

export const subscriptionHistory = createSoapQueryDefinition<
  SubscriptionHistoryRequest,
  SubscriptionHistoryReply
>({
  service: 'Common',
  query: 'subscriptionHistory',
  getSchema: (client) => {
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    return client.describe().SubscriptionManagementService
      .SubscriptionManagementPort.subscriptionHistory.input;
  },
});
