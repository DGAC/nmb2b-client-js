import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type { HotspotListRequest, HotspotListReply } from './types.ts';

export const queryHotspots = createSoapQueryDefinition<
  HotspotListRequest,
  HotspotListReply
>({
  service: 'Flow',
  query: 'queryHotspots',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort.queryHotspots
      .input,
});
