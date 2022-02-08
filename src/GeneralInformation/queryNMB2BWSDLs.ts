import { GeneralInformationServiceClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import type { NMB2BWSDLsReply, NMB2BWSDLsRequest } from './types';

type Values = NMB2BWSDLsRequest;
type Result = NMB2BWSDLsReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryNMB2BWSDLs(
  client: GeneralInformationServiceClient,
): Resolver {
  // console.log(client.describe());
  const schema =
    client.describe().NMB2BInfoService.NMB2BInfoPort.queryNMB2BWSDLs.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'GeneralInformation',
    query: 'queryNMB2BWSDLs',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.queryNMB2BWSDLs(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
