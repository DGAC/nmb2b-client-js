import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type { NMB2BWSDLsReply, NMB2BWSDLsRequest } from './types.ts';

export const queryNMB2BWSDLs = createSoapQueryDefinition<
  NMB2BWSDLsRequest,
  NMB2BWSDLsReply
>({
  service: 'GeneralInformation',
  query: 'queryNMB2BWSDLs',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().NMB2BInfoService.NMB2BInfoPort.queryNMB2BWSDLs.input,
});
