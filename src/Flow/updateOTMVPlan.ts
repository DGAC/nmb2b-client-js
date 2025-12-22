import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type { OTMVPlanUpdateReply, OTMVPlanUpdateRequest } from './types.js';

export const updateOTMVPlan = createSoapQueryDefinition<
  OTMVPlanUpdateRequest,
  OTMVPlanUpdateReply
>({
  service: 'Flow',
  query: 'updateOTMVPlan',
  getSchema: (client) =>
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort.updateOTMVPlan
      .input,
});
