/* @flow */
import type { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import type { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';

import type { OTMVPlanRetrievalRequest, OTMVPlanRetrievalReply } from './types';
export type { OTMVPlanRetrievalRequest, OTMVPlanRetrievalReply } from './types';

export type Values = OTMVPlanRetrievalRequest;
export type Result = OTMVPlanRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveOTMVPlan(client: FlowClient): Resolver {
  const schema = client.describe().TacticalUpdatesService.TacticalUpdatesPort
    .retrieveOTMVPlan.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.retrieveOTMVPlan(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}
