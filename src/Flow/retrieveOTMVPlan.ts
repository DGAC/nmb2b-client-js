import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  OTMVPlanRetrievalRequest,
  OTMVPlanRetrievalReply,
} from './types.ts';

export const retrieveOTMVPlan = createSoapQueryDefinition<
  OTMVPlanRetrievalRequest,
  OTMVPlanRetrievalReply
>({
  service: 'Flow',
  query: 'retrieveOTMVPlan',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .retrieveOTMVPlan.input,
});
