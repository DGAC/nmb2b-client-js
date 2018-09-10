/* @flow */
import type { AirspaceClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import type { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';

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

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.retrieveAUP(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}

import type { AUPId, AUP } from './types';
import type { Request, Reply } from '../Common/types';

export interface AUPRetrievalRequest {
  aupId: AUPId;
  returnComputed?: boolean;
}

export interface AUPRetrievalReply extends Reply {
  data: {
    aup: AUP,
  };
}
