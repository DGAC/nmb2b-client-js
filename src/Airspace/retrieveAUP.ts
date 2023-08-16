import { AirspaceClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

type Values = AUPRetrievalRequest;
type Result = AUPRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveAUP(client: AirspaceClient): Resolver {
  const schema = client.describe().AirspaceAvailabilityService
    .AirspaceAvailabilityPort.retrieveAUP.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Airspace',
    query: 'retrieveAUP',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.retrieveAUP(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}

import { AUPId, AUP } from './types';
import { Reply } from '../Common/types';

export interface AUPRetrievalRequest {
  aupId: AUPId;
  returnComputed?: boolean;
}

export interface AUPRetrievalReply extends Reply {
  data: {
    aup: AUP;
  };
}
