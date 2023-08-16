import { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import { OTMVPlanRetrievalRequest, OTMVPlanRetrievalReply } from './types';
export { OTMVPlanRetrievalRequest, OTMVPlanRetrievalReply } from './types';

export type Values = OTMVPlanRetrievalRequest;
export type Result = OTMVPlanRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveOTMVPlan(client: FlowClient): Resolver {
  const schema =
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .retrieveOTMVPlan.input;

  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flow',
    query: 'retrieveOTMVPlan',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.retrieveOTMVPlan(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
