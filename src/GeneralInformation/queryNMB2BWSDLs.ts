import type { GeneralInformationServiceClient } from './index.js';
import { injectSendTime, responseStatusHandler } from '../utils/internals.js';
import type { SoapOptions } from '../soap.js';
import { prepareSerializer } from '../utils/transformers/index.js';
import { instrument } from '../utils/instrumentation/index.js';

import type { NMB2BWSDLsReply, NMB2BWSDLsRequest } from './types.js';
export type { NMB2BWSDLsReply, NMB2BWSDLsRequest };

type Values = NMB2BWSDLsRequest;
type Result = NMB2BWSDLsReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryNMB2BWSDLs(
  client: GeneralInformationServiceClient,
): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().NMB2BInfoService.NMB2BInfoPort.queryNMB2BWSDLs.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'GeneralInformation',
    query: 'queryNMB2BWSDLs',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.queryNMB2BWSDLs(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
