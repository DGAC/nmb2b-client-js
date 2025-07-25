import type { GeneralInformationServiceClient } from './index.js';
import { injectSendTime, responseStatusHandler } from '../utils/internals.js';
import type { SoapOptions } from '../soap.js';
import { prepareSerializer } from '../utils/transformers/index.js';
import { instrument } from '../utils/instrumentation/index.js';

import type { UserInformationRequest, UserInformationReply } from './types.js';
export type { UserInformationRequest, UserInformationReply };

type Values = UserInformationRequest;
type Result = UserInformationReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveUserInformation(
  client: GeneralInformationServiceClient,
): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().NMB2BInfoService.NMB2BInfoPort.retrieveUserInformation
      .input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'GeneralInformation',
    query: 'retrieveUserInformation',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.retrieveUserInformation(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
