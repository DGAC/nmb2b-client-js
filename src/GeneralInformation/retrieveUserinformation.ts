import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type { UserInformationReply, UserInformationRequest } from './types.js';

export const retrieveUserInformation = createSoapQueryDefinition<
  UserInformationRequest,
  UserInformationReply
>({
  service: 'GeneralInformation',
  query: 'retrieveUserInformation',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().NMB2BInfoService.NMB2BInfoPort.retrieveUserInformation
      .input,
});
