import type { SoapOptions } from '../soap.js';
import { instrument } from '../utils/instrumentation/index.js';
import {
  injectSendTime,
  responseStatusHandler,
  type InjectSendTime,
} from '../utils/internals.js';
import { prepareSerializer } from '../utils/transformers/index.js';
import type { AirspaceClient } from './index.js';
import type {
  EAUPChainRetrievalReply,
  EAUPChainRetrievalRequest,
} from './types.js';

export type { EAUPChainRetrievalReply, EAUPChainRetrievalRequest };

type Input = InjectSendTime<EAUPChainRetrievalRequest>;
type Result = EAUPChainRetrievalReply;

export type Resolver = (
  values: Input,
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

  return instrument<Input, Result>({
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
