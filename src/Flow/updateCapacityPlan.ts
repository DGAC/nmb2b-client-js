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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .updateCapacityPlan.input,
});
