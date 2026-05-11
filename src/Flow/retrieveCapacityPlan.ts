import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  CapacityPlanRetrievalRequest,
  CapacityPlanRetrievalReply,
} from './types.ts';

export const retrieveCapacityPlan = createSoapQueryDefinition<
  CapacityPlanRetrievalRequest,
  CapacityPlanRetrievalReply
>({
  service: 'Flow',
  query: 'retrieveCapacityPlan',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .retrieveCapacityPlan.input,
});
