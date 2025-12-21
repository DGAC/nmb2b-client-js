import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type { UserInformationReply, UserInformationRequest } from './types.ts';

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
