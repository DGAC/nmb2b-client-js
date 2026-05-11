import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type { OTMVPlanUpdateReply, OTMVPlanUpdateRequest } from './types.ts';

export const updateOTMVPlan = createSoapQueryDefinition<
  OTMVPlanUpdateRequest,
  OTMVPlanUpdateReply
>({
  service: 'Flow',
  query: 'updateOTMVPlan',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort.updateOTMVPlan
      .input,
});
