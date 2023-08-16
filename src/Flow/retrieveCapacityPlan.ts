import { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import {
  CapacityPlanRetrievalRequest,
  CapacityPlanRetrievalReply,
} from './types';

export {
  CapacityPlanRetrievalRequest,
  CapacityPlanRetrievalReply,
} from './types';

export type Values = CapacityPlanRetrievalRequest;
export type Result = CapacityPlanRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveCapacityPlan(
  client: FlowClient,
): Resolver {
  const schema = client.describe().TacticalUpdatesService.TacticalUpdatesPort
    .retrieveCapacityPlan.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flow',
    query: 'retrieveCapacityPlan',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.retrieveCapacityPlan(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
