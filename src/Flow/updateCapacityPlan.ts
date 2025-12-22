import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  CapacityPlanUpdateReply,
  CapacityPlanUpdateRequest,
} from './types.js';

export const updateCapacityPlan = createSoapQueryDefinition<
  CapacityPlanUpdateRequest,
  CapacityPlanUpdateReply
>({
  service: 'Flow',
  query: 'updateCapacityPlan',
  getSchema: (client) =>
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .updateCapacityPlan.input,
});
