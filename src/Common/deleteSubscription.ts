import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  SubscriptionDeletionRequest,
  SubscriptionDeletionReply,
} from './types.ts';

export const deleteSubscription = createSoapQueryDefinition<
  SubscriptionDeletionRequest,
  SubscriptionDeletionReply
>({
  service: 'Common',
  query: 'deleteSubscription',
  getSchema: (client) => {
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    return client.describe().SubscriptionManagementService
      .SubscriptionManagementPort.deleteSubscription.input;
  },
});
