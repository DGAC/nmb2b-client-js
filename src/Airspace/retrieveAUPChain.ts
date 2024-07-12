import type { SoapOptions } from '../soap';
import { instrument } from '../utils/instrumentation';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { prepareSerializer } from '../utils/transformers';
import type { AirspaceClient } from './';
import type { AUPChainRetrievalReply, AUPChainRetrievalRequest } from './types';
export type { AUPChainRetrievalReply, AUPChainRetrievalRequest };

type Values = AUPChainRetrievalRequest;
type Result = AUPChainRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveAUPChain(
  client: AirspaceClient,
): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().AirspaceAvailabilityService.AirspaceAvailabilityPort
      .retrieveAUPChain.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Airspace',
    query: 'retrieveAUPChain',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.retrieveAUPChain(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
