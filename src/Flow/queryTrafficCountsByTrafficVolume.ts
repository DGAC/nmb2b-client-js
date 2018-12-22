import { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import {
  TrafficCountsByTrafficVolumeRequest,
  TrafficCountsByTrafficVolumeReply,
} from './types';

export {
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

  return instrument<Values, Result>({
    service: 'Flow',
    query: 'queryTrafficCountsByTrafficVolume',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.queryTrafficCountsByTrafficVolume(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
