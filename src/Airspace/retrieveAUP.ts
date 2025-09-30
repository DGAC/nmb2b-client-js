import type { SoapOptions } from '../soap.js';
import { instrument } from '../utils/instrumentation/index.js';
import {
  injectSendTime,
  responseStatusHandler,
  type InjectSendTime,
} from '../utils/internals.js';
import { prepareSerializer } from '../utils/transformers/index.js';
import type { AirspaceClient } from './index.js';

import type { AUPRetrievalReply, AUPRetrievalRequest } from './types.js';
export type { AUPRetrievalReply, AUPRetrievalRequest };

type Input = InjectSendTime<AUPRetrievalRequest>;
type Result = AUPRetrievalReply;

export type Resolver = (
  values: Input,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveAUP(client: AirspaceClient): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().AirspaceAvailabilityService.AirspaceAvailabilityPort
      .retrieveAUP.input;
  const serializer = prepareSerializer(schema);

  return instrument<Input, Result>({
    service: 'Airspace',
    query: 'retrieveAUP',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.retrieveAUP(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
