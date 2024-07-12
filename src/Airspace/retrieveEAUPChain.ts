import type { SoapOptions } from '../soap';
import { instrument } from '../utils/instrumentation';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { prepareSerializer } from '../utils/transformers';
import type { AirspaceClient } from './';
import type { DateYearMonthDay, Reply } from '../Common/types';

import type { CollapseEmptyObjectsToNull } from '../utils/types';
import type { EAUPChain } from './types';

type Values = EAUPChainRetrievalRequest;
type Result = EAUPChainRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveEAUPChain(
  client: AirspaceClient,
): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().AirspaceAvailabilityService.AirspaceAvailabilityPort
      .retrieveEAUPChain.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Airspace',
    query: 'retrieveEAUPChain',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.retrieveEAUPChain(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}

export interface EAUPChainRetrievalRequest {
  chainDate: DateYearMonthDay;
}

export type EAUPChainRetrievalReply = CollapseEmptyObjectsToNull<
  Reply & {
    data: {
      chain: EAUPChain;
    };
  }
>;
