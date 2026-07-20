import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  SubscriptionPauseRequest,
  SubscriptionPauseReply,
} from './types.ts';

export const pauseSubscription = createSoapQueryDefinition<
  SubscriptionPauseRequest,
  SubscriptionPauseReply
>({
  service: 'Common',
  query: 'pauseSubscription',
  getSchema: (client) => {
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    return client.describe().SubscriptionManagementService
      .SubscriptionManagementPort.pauseSubscription.input;
  },
});
