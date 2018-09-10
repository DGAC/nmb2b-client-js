/* @flow */
import type { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import type { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';

import type {
  TrafficCountsByTrafficVolumeRequest,
  TrafficCountsByTrafficVolumeReply,
} from './types';
export type {
  TrafficCountsByTrafficVolumeRequest,
  TrafficCountsByTrafficVolumeReply,
} from './types';

type Values = TrafficCountsByTrafficVolumeRequest;
type Result = TrafficCountsByTrafficVolumeReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryTrafficCountsByTrafficVolume(
  client: FlowClient,
): Resolver {
  const schema = client.describe().TrafficCountsService.TrafficCountsPort
    .queryTrafficCountsByTrafficVolume.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.queryTrafficCountsByTrafficVolume(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}
