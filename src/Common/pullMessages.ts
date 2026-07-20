import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type { MessagePullRequest, MessagePullReply } from './types.ts';

export const pullMessages = createSoapQueryDefinition<
  MessagePullRequest,
  MessagePullReply
>({
  service: 'Common',
  query: 'pullMessages',
  getSchema: (client) => {
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    return client.describe().MessagingService.MessagingPort.pullMessages.input;
  },
});
