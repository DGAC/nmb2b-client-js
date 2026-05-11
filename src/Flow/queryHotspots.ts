import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type { HotspotListRequest, HotspotListReply } from './types.ts';

export const queryHotspots = createSoapQueryDefinition<
  HotspotListRequest,
  HotspotListReply
>({
  service: 'Flow',
  query: 'queryHotspots',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort.queryHotspots
      .input,
});
