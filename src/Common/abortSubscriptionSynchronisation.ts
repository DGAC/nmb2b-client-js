import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  SubscriptionSynchronisationAbortRequest,
  SubscriptionSynchronisationAbortReply,
} from './types.ts';

export const abortSubscriptionSynchronisation = createSoapQueryDefinition<
  SubscriptionSynchronisationAbortRequest,
  SubscriptionSynchronisationAbortReply
>({
  service: 'Common',
  query: 'abortSubscriptionSynchronisation',
  getSchema: (client) => {
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    return client.describe().SubscriptionManagementService
      .SubscriptionManagementPort.abortSubscriptionSynchronisation.input;
  },
});
