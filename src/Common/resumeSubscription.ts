import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  SubscriptionResumeRequest,
  SubscriptionResumeReply,
} from './types.ts';

export const resumeSubscription = createSoapQueryDefinition<
  SubscriptionResumeRequest,
  SubscriptionResumeReply
>({
  service: 'Common',
  query: 'resumeSubscription',
  getSchema: (client) => {
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    return client.describe().SubscriptionManagementService
      .SubscriptionManagementPort.resumeSubscription.input;
  },
});
