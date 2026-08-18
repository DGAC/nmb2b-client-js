import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  SubscriptionListRequest,
  SubscriptionListReply,
} from './types.ts';

export const listSubscriptions = createSoapQueryDefinition<
  SubscriptionListRequest,
  SubscriptionListReply
>({
  service: 'Common',
  query: 'listSubscriptions',
  getSchema: (client) => {
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    return client.describe().SubscriptionManagementService
      .SubscriptionManagementPort.listSubscriptions.input;
  },
});
