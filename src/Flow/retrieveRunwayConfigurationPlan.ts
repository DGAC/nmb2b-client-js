import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  RunwayConfigurationPlanRetrievalReply,
  RunwayConfigurationPlanRetrievalRequest,
} from './types.js';

export const retrieveRunwayConfigurationPlan = createSoapQueryDefinition<
  RunwayConfigurationPlanRetrievalRequest,
  RunwayConfigurationPlanRetrievalReply
>({
  service: 'Flow',
  query: 'retrieveRunwayConfigurationPlan',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .retrieveRunwayConfigurationPlan.input,
});
