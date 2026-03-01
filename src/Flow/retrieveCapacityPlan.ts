import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  CapacityPlanRetrievalRequest,
  CapacityPlanRetrievalReply,
} from './types.js';

export const retrieveCapacityPlan = createSoapQueryDefinition<
  CapacityPlanRetrievalRequest,
  CapacityPlanRetrievalReply
>({
  service: 'Flow',
  query: 'retrieveCapacityPlan',
  getSchema: (client) =>
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .retrieveCapacityPlan.input,
});
