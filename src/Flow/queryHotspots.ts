import { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import { HotspotListRequest, HotspotListReply } from './types';
export { HotspotListRequest, HotspotListReply } from './types';

type Values = HotspotListRequest;
type Result = HotspotListReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryHotspots(client: FlowClient): Resolver {
  // console.log(client.describe());
  const schema = client.describe().TacticalUpdatesService.TacticalUpdatesPort
    .queryHotspots.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flow',
    query: 'queryHotspots',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.queryHotspots(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
