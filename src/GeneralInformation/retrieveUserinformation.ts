import { GeneralInformationServiceClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import type { UserInformationRequest, UserInformationReply } from './types';

type Values = UserInformationRequest;
type Result = UserInformationReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveUserInformation(
  client: GeneralInformationServiceClient,
): Resolver {
  // console.log(client.describe());
  const schema =
    client.describe().NMB2BInfoService.NMB2BInfoPort.retrieveUserInformation.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'GeneralInformation',
    query: 'retrieveUserInformation',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.retrieveUserInformation(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
