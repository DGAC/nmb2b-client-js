import type { AirspaceClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import type { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';
import type { AUPId, AUP } from './types';
import type { Reply } from '../Common/types';
import type { CollapseEmptyObjectsToNull } from '../utils/types';

type Values = AUPRetrievalRequest;
type Result = AUPRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveAUP(client: AirspaceClient): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().AirspaceAvailabilityService.AirspaceAvailabilityPort
      .retrieveAUP.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
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

export interface AUPRetrievalRequest {
  aupId: AUPId;
  returnComputed?: boolean;
}

export type AUPRetrievalReply = CollapseEmptyObjectsToNull<
  Reply & {
    data: {
      aup: AUP;
    };
  }
>;
