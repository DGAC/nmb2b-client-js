/* @flow */
import type { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import type { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';

import type {
  TrafficCountsByAirspaceRequest,
  TrafficCountsByAirspaceReply,
} from './types';

type Values = TrafficCountsByAirspaceRequest;
type Result = TrafficCountsByAirspaceReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryTrafficCountsByAirspace(
  client: FlowClient,
): Resolver {
  const schema = client.describe().TrafficCountsService.TrafficCountsPort
    .queryTrafficCountsByAirspace.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.queryTrafficCountsByAirspace(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}
