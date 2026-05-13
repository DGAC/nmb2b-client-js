import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  RunwayConfigurationPlanRetrievalReply,
  RunwayConfigurationPlanRetrievalRequest,
} from './types.ts';

export const retrieveRunwayConfigurationPlan = createSoapQueryDefinition<
  RunwayConfigurationPlanRetrievalRequest,
  RunwayConfigurationPlanRetrievalReply
>({
  service: 'Flow',
  query: 'retrieveRunwayConfigurationPlan',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .retrieveRunwayConfigurationPlan.input,
});
