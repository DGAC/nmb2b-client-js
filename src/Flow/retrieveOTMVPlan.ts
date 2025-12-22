import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  OTMVPlanRetrievalRequest,
  OTMVPlanRetrievalReply,
} from './types.js';

export const retrieveOTMVPlan = createSoapQueryDefinition<
  OTMVPlanRetrievalRequest,
  OTMVPlanRetrievalReply
>({
  service: 'Flow',
  query: 'retrieveOTMVPlan',
  getSchema: (client) =>
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .retrieveOTMVPlan.input,
});
