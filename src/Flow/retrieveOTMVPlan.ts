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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .retrieveOTMVPlan.input,
});
