import { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import { RunwayConfigurationPlanRetrievalRequest, RunwayConfigurationPlanRetrievalReply } from './types';
export { RunwayConfigurationPlanRetrievalRequest, RunwayConfigurationPlanRetrievalReply } from './types';

export type Values = RunwayConfigurationPlanRetrievalRequest;
export type Result = RunwayConfigurationPlanRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveRunwayConfigurationPlan(client: FlowClient): Resolver {
  const schema = client.describe().TacticalUpdatesService.TacticalUpdatesPort
    .retrieveRunwayConfigurationPlan.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flow',
    query: 'retrieveRunwayConfigurationPlan',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.retrieveRunwayConfigurationPlan(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
