import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type { OTMVPlanUpdateReply, OTMVPlanUpdateRequest } from './types.ts';

export const updateOTMVPlan = createSoapQueryDefinition<
  OTMVPlanUpdateRequest,
  OTMVPlanUpdateReply
>({
  service: 'Flow',
  query: 'updateOTMVPlan',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort.updateOTMVPlan
      .input,
});
