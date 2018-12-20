import { AirspaceClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';

type Values = AUPChainRetrievalRequest;
type Result = AUPChainRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveAUPChain(
  client: AirspaceClient,
): Resolver {
  const schema = client.describe().AirspaceAvailabilityService
    .AirspaceAvailabilityPort.retrieveAUPChain.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.retrieveAUPChain(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}

import {
  DateYearMonthDay,
  AirNavigationUnitId,
  Request,
  Reply,
} from '../Common/types';

import { AUPChain } from './types';

export type AUPChainRetrievalRequest = {
  chainDate: DateYearMonthDay;
  amcIds?: Array<AirNavigationUnitId>;
};

export type AUPChainRetrievalReply = Reply & {
  data: {
    chains: Array<AUPChain>;
  };
};
