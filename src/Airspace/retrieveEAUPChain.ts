import { AirspaceClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

type Values = EAUPChainRetrievalRequest;
type Result = EAUPChainRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveEAUPChain(
  client: AirspaceClient,
): Resolver {
  const schema =
    client.describe().AirspaceAvailabilityService.AirspaceAvailabilityPort
      .retrieveEAUPChain.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Airspace',
    query: 'retrieveEAUPChain',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.retrieveEAUPChain(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}

import type { DateYearMonthDay, Reply } from '../Common/types';

import { EAUPChain } from './types';

export interface EAUPChainRetrievalRequest {
  chainDate: DateYearMonthDay;
}

export type EAUPChainRetrievalReply = Reply & {
  data: {
    chain: EAUPChain;
  };
};
