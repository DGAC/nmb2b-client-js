import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  CapacityPlanUpdateReply,
  CapacityPlanUpdateRequest,
} from './types.ts';

export const updateCapacityPlan = createSoapQueryDefinition<
  CapacityPlanUpdateRequest,
  CapacityPlanUpdateReply
>({
  service: 'Flow',
  query: 'updateCapacityPlan',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .updateCapacityPlan.input,
});
