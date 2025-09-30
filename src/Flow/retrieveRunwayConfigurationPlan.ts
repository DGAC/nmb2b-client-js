import type { FlowClient } from './index.js';
import {
  injectSendTime,
  responseStatusHandler,
  type InjectSendTime,
} from '../utils/internals.js';
import type { SoapOptions } from '../soap.js';
import { prepareSerializer } from '../utils/transformers/index.js';
import { instrument } from '../utils/instrumentation/index.js';

import type {
  RunwayConfigurationPlanRetrievalRequest,
  RunwayConfigurationPlanRetrievalReply,
} from './types.js';

export type {
  RunwayConfigurationPlanRetrievalRequest,
  RunwayConfigurationPlanRetrievalReply,
} from './types.js';

type Input = InjectSendTime<RunwayConfigurationPlanRetrievalRequest>;
type Result = RunwayConfigurationPlanRetrievalReply;

export type Resolver = (
  values: Input,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveRunwayConfigurationPlan(
  client: FlowClient,
): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .retrieveRunwayConfigurationPlan.input;
  const serializer = prepareSerializer(schema);

  return instrument<Input, Result>({
    service: 'Flow',
    query: 'retrieveRunwayConfigurationPlan',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.retrieveRunwayConfigurationPlan(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
